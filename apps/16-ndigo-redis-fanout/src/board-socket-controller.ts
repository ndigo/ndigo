/**
 * The board socket endpoint: every session joins the `board` room, and every
 * inbound message is republished into that room through the registry. With a
 * fan-out configured, the republish travels over Redis, so the sessions of
 * every node receive it — the cross-node half of the demo. Without one, the
 * identical code delivers to this node's sessions only.
 * @module ndigo-redis-fanout
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { parameters, requestMapping, socketMapping, socketSessionValue, type SocketSession } from '@ndigo/dispatcher';
import { BOARD_ROOM, BOARD_TEXT_MAX, boardMessage, boardText } from './board-message';
import type { FanoutBackend } from './fanout-backend';

/**
 * `WS /ws/board` — the broadcast board.
 */
@requestMapping('/ws')
export class BoardSocketController {
    readonly #backend: FanoutBackend;

    /**
     * @param backend - The backend owning the registry (and its fan-out).
     */
    constructor(backend: FanoutBackend) {
        this.#backend = backend;
    }

    /**
     * Joins the room and republishes every inbound message into it.
     *
     * The handler is the broadcast style: outbound traffic goes through the
     * registry rather than the handler's own stream, which is what lets the
     * message reach sessions on other nodes. The sender receives its own
     * message too (room echo semantics) — from its own node's local delivery,
     * not from the Redis echo, which the fan-out's origin marker suppresses.
     *
     * A message that is empty or longer than {@link BOARD_TEXT_MAX} is refused
     * to the sender alone (`board-error`), never fanned out: it keeps the
     * published envelope bounded instead of letting one client push an
     * unbounded body onto every node.
     *
     * @param session - The live connection.
     */
    @socketMapping('/board')
    @parameters({ session: socketSessionValue('session') })
    async board(session: SocketSession) {
        session.join(BOARD_ROOM);
        for await (const message of session.messages) {
            const text = boardText(message);
            if (text.length === 0 || text.length > BOARD_TEXT_MAX) {
                session.send({
                    event: 'board-error',
                    detail: `expected 1–${BOARD_TEXT_MAX} characters of text`,
                });
                continue;
            }
            await this.#backend.registry.broadcastTo(BOARD_ROOM, boardMessage(this.#backend.instanceId, text));
        }
    }
}
