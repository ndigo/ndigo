/**
 * The board WebSocket endpoint: `WS /ws/board/:boardId`.
 *
 * The board id is bound from the path (`pathVariable('boardId')`), so a client
 * "joins a board" simply by connecting to that URL. The handler:
 *
 * 1. refuses an unknown board with close `1008` (nothing to sync, and a
 *    silently-empty board would be indistinguishable from a real one),
 * 2. joins the registry room `board:<id>` — the exact room `BoardBroadcaster`
 *    fans writes out on,
 * 3. sends the **authoritative snapshot first**, which is the whole
 *    reconciliation story: a reconnecting client is resynchronized instead of
 *    replaying events it may have missed (no backlog, no duplicate `at`
 *    ordering games), and only then
 * 4. drains inbound frames until the peer closes, answering `resync` with a
 *    fresh snapshot and anything else with an `error` frame.
 */
import '@tsmetadata/polyfill';
import { parameters, pathVariable, requestMapping, socketMapping, socketSessionValue } from '@ndigo/dispatcher';
import type { SocketSession } from '@ndigo/dispatcher';
import { getLogger } from '@ndigo/log';
import type { BoardService } from './board-service';
import { BOARD_ID, boardRoom, envelope, ERROR_EVENT, parseInbound, RESYNC_EVENT, SNAPSHOT_EVENT } from './protocol';

const logger = getLogger('ndigo-kanban');

/**
 * The per-board socket endpoint.
 */
@requestMapping('/ws/board')
export class BoardSocketController {
    readonly #boards: BoardService;

    /**
     * @param boards - The board service the snapshot is read from.
     */
    constructor(boards: BoardService) {
        this.#boards = boards;
    }

    /**
     * Board endpoint: validate, join the room, reconcile, then stream until
     * the peer closes.
     *
     * @param session - The connection's session.
     * @param boardId - The path-bound board id.
     */
    @socketMapping('/:boardId')
    @parameters({ session: socketSessionValue('session'), boardId: pathVariable('boardId') })
    async board(session: SocketSession, boardId: string): Promise<void> {
        const parsed = BOARD_ID.safeParse(boardId);
        if (!parsed.success) {
            session.close(1008, 'invalid board id');
            return;
        }
        const id = parsed.data;
        if (this.#boards.snapshot(id) === undefined) {
            session.close(1008, `unknown board '${id}'`);
            return;
        }

        const room = boardRoom(id);
        session.join(room);
        this.#sendSnapshot(session, id);
        logger.info(`join ${room}`);

        try {
            for await (const raw of session.messages) {
                const frame = parseInbound(raw);
                if (frame === null) {
                    session.send(envelope(ERROR_EVENT, { reason: 'malformed frame' }));
                    continue;
                }
                if (frame.event === RESYNC_EVENT) {
                    this.#sendSnapshot(session, id);
                    continue;
                }
                session.send(envelope(ERROR_EVENT, { reason: `unknown event: ${frame.event}` }));
            }
        } finally {
            session.leave(room);
            logger.info(`leave ${room}`);
        }
    }

    /**
     * Sends the board's current state to one session.
     *
     * @param session - The session to reconcile.
     * @param boardId - The board to read.
     */
    #sendSnapshot(session: SocketSession, boardId: string): void {
        const snapshot = this.#boards.snapshot(boardId);
        if (snapshot !== undefined) {
            session.send(envelope(SNAPSHOT_EVENT, snapshot));
        }
    }
}
