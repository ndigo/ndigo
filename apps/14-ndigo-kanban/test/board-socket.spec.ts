/**
 * The board socket end to end: the real application stack booted on an
 * ephemeral port, driven by the Node global WHATWG `WebSocket` (and `fetch`
 * for the writes), because the interesting properties are cross-client ones —
 * two clients seeing each other's writes, a reconnect reconciling from the
 * snapshot before the event stream resumes, and two boards never leaking into
 * each other's room.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { z } from 'zod';
import { ApplicationBuilder } from '@ndigo/boot';
import { HTTP_SERVER, NodeAutoConfiguration, type HTTPServer } from '@ndigo/platform-node';
import { BoardSnapshotSchema, CardSchema } from '../src/board-model';
import { BOARD_SERVICE, DEMO_BOARD } from '../src/board-service';
import { KanbanConfiguration } from '../src/kanban-configuration';

/** The second board the isolation case subscribes to. */
const OTHER_BOARD = {
    id: 'beta',
    title: 'Beta board',
    columns: [{ id: 'beta-todo', title: 'Todo', cards: ['beta card'] }],
} as const;

/** The demo board's first column — the one the socket and REST cases write to. */
const DEMO_COLUMN = DEMO_BOARD.columns[0].id;

/** The shared wire envelope. */
const EnvelopeSchema = z.object({ event: z.string(), data: z.unknown(), at: z.number() });

/** `{ card }` — the create envelope the REST surface answers with. */
const CardEnvelope = z.object({ card: CardSchema });

/** One received frame. */
interface Frame {
    event: string;
    data: unknown;
    at: number;
}

/** A live test peer draining its socket into a frame array. */
interface Peer {
    readonly frames: Frame[];
    /** Resolves with the close code when the peer's socket closes. */
    readonly closed: Promise<number>;
    send(event: string, data: unknown): void;
    /** Sends a verbatim frame (for the malformed-frame case). */
    sendRaw(text: string): void;
    close(): void;
}

/**
 * Opens a WebSocket peer and starts collecting parsed frames.
 *
 * @param url - The socket URL.
 * @returns The peer, once the connection is open.
 */
async function connect(url: string): Promise<Peer> {
    const socket = new WebSocket(url);
    const frames: Frame[] = [];
    let resolveClosed: (code: number) => void = () => undefined;
    const closed = new Promise<number>((resolve) => {
        resolveClosed = resolve;
    });
    socket.onmessage = (event) => {
        if (typeof event.data !== 'string') {
            return;
        }
        try {
            frames.push(EnvelopeSchema.parse(JSON.parse(event.data)));
        } catch {
            // Not a JSON frame we know; ignore.
        }
    };
    socket.onclose = (event) => resolveClosed(event.code);
    await new Promise<void>((resolve, reject) => {
        socket.onopen = () => resolve();
        socket.onerror = () => reject(new Error(`socket refused: ${url}`));
    });
    return {
        frames,
        closed,
        send(event, data) {
            socket.send(JSON.stringify({ event, data }));
        },
        sendRaw(text) {
            socket.send(text);
        },
        close() {
            socket.close(1000, 'spec');
        },
    };
}

/**
 * Polls until the peer has a frame matching `predicate`.
 *
 * @param peer - The peer to inspect.
 * @param predicate - Frame match predicate.
 * @param timeoutMs - Fail after this many milliseconds.
 * @returns The matching frame.
 */
async function waitFor(peer: Peer, predicate: (frame: Frame) => boolean, timeoutMs = 5_000): Promise<Frame> {
    const started = Date.now();
    for (;;) {
        const match = peer.frames.find(predicate);
        if (match !== undefined) {
            return match;
        }
        if (Date.now() - started > timeoutMs) {
            throw new Error(`timed out waiting for a frame (have ${peer.frames.length})`);
        }
        // oxlint-disable-next-line no-await-in-loop -- re-reads the just-updated frame list
        await new Promise<void>((resolve) => setTimeout(resolve, 10));
    }
}

/** The `card-created` frame whose card has this id. */
function createdCardId(frame: Frame): string | undefined {
    const parsed = z.object({ card: CardSchema }).safeParse(frame.data);
    return parsed.success ? parsed.data.card.id : undefined;
}

describe('ndigo-kanban board sockets', () => {
    let context: Awaited<ReturnType<ApplicationBuilder['run']>>;
    let socketBase: string;
    let httpBase: string;
    const peers: Peer[] = [];

    beforeAll(async () => {
        process.env['PORT'] = '0';
        context = await new ApplicationBuilder([NodeAutoConfiguration, KanbanConfiguration])
            .properties({ 'server.port': '0', 'server.name': 'kanban-spec' })
            .run();
        const server = context.getValue<HTTPServer>(HTTP_SERVER);
        await server.start();
        const bound = server.server as { address: () => { port: number } | null };
        const port = bound.address()?.port;
        socketBase = `ws://127.0.0.1:${port}`;
        httpBase = `http://127.0.0.1:${port}`;
        // The isolation case needs a second board; the service's bootstrap path
        // is the documented way to write one (nothing else touches it here).
        context.getValue(BOARD_SERVICE).bootstrap(OTHER_BOARD);
    }, 30_000);

    afterAll(async () => {
        for (const peer of peers) {
            peer.close();
        }
        context.close();
        delete process.env['PORT'];
    });

    /** Connects a peer to a board and tracks it for teardown. */
    const join = async (boardId: string): Promise<Peer> => {
        const peer = await connect(`${socketBase}/ws/board/${boardId}`);
        peers.push(peer);
        return peer;
    };

    /** Creates a card over the REST surface and returns its id. */
    const createCard = async (columnId: string, title: string): Promise<string> => {
        const response = await fetch(`${httpBase}/api/columns/${columnId}/cards`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ title }),
        });
        expect(response.status).toBe(201);
        return CardEnvelope.parse(await response.json()).card.id;
    };

    /** Reads a board over the REST surface. */
    const readBoard = async (boardId: string) => {
        const response = await fetch(`${httpBase}/api/boards/${boardId}`);
        expect(response.status).toBe(200);
        const body = z.object({ board: BoardSnapshotSchema }).parse(await response.json());
        return body.board;
    };

    test('every joiner receives the snapshot first', async () => {
        const peer = await join(DEMO_BOARD.id);
        const frame = await waitFor(peer, (candidate) => candidate.event === 'snapshot');
        const snapshot = BoardSnapshotSchema.parse(frame.data);
        expect(snapshot.id).toBe(DEMO_BOARD.id);
        expect(snapshot.columns.map((column) => column.id)).toEqual(DEMO_BOARD.columns.map((column) => column.id));
        expect(peer.frames[0]?.event).toBe('snapshot');
        expect(typeof frame.at).toBe('number');
    });

    test('two clients in a room see each other’s card events', async () => {
        const alice = await join(DEMO_BOARD.id);
        const bob = await join(DEMO_BOARD.id);
        await waitFor(alice, (frame) => frame.event === 'snapshot');
        await waitFor(bob, (frame) => frame.event === 'snapshot');

        const cardId = await createCard(DEMO_COLUMN, 'Broadcast me');

        const seen = await Promise.all(
            [alice, bob].map((peer) =>
                waitFor(peer, (candidate) => candidate.event === 'card-created' && createdCardId(candidate) === cardId)
            )
        );
        for (const frame of seen) {
            const parsed = CardEnvelope.parse(frame.data);
            expect(parsed.card.id).toBe(cardId);
            expect(parsed.card.version).toBe(1);
        }
    });

    test('a reconnect gets the authoritative snapshot, then the event stream', async () => {
        const first = await join(DEMO_BOARD.id);
        await waitFor(first, (frame) => frame.event === 'snapshot');
        const before = await readBoard(DEMO_BOARD.id);
        const beforeIds = before.columns.flatMap((column) => column.cards.map((card) => card.id));

        // While nobody is listening: two writes the reconnecting client never saw.
        const missed = [await createCard(DEMO_COLUMN, 'Missed one'), await createCard(DEMO_COLUMN, 'Missed two')];
        first.close();

        const second = await join(DEMO_BOARD.id);
        const snapshotFrame = await waitFor(second, (frame) => frame.event === 'snapshot');
        const snapshot = BoardSnapshotSchema.parse(snapshotFrame.data);
        const snapshotIds = snapshot.columns.flatMap((column) => column.cards.map((card) => card.id));
        for (const id of [...beforeIds, ...missed]) {
            expect(snapshotIds).toContain(id);
        }

        // The snapshot is the reconciliation; everything after it is live.
        const live = await createCard(DEMO_COLUMN, 'After the reconnect');
        await waitFor(second, (frame) => frame.event === 'card-created' && createdCardId(frame) === live);
        const snapshotIndex = second.frames.findIndex((frame) => frame.event === 'snapshot');
        const firstEventIndex = second.frames.findIndex((frame) => frame.event === 'card-created');
        expect(snapshotIndex).toBeLessThan(firstEventIndex);
        expect(snapshotIds).not.toContain(live);
    });

    test('a board room never leaks into another board room', async () => {
        const demo = await join(DEMO_BOARD.id);
        const other = await join(OTHER_BOARD.id);
        await waitFor(demo, (frame) => frame.event === 'snapshot');
        const otherSnapshot = await waitFor(other, (frame) => frame.event === 'snapshot');
        expect(BoardSnapshotSchema.parse(otherSnapshot.data).id).toBe(OTHER_BOARD.id);

        // A write on the other board: its own room sees it, the demo room does not.
        const otherCardId = await createCard(OTHER_BOARD.columns[0].id, 'Other board card');
        await waitFor(other, (frame) => frame.event === 'card-created' && createdCardId(frame) === otherCardId);
        expect(demo.frames.every((frame) => frame.event === 'snapshot')).toBe(true);

        // …and the mirror image: a demo write reaches only the demo room.
        const demoCardId = await createCard(DEMO_COLUMN, 'Demo board card');
        await waitFor(demo, (frame) => frame.event === 'card-created' && createdCardId(frame) === demoCardId);
        expect(other.frames.filter((frame) => frame.event === 'card-created')).toHaveLength(1);
    });

    test('resync answers with a fresh snapshot; unknown and malformed frames answer with an error', async () => {
        const peer = await join(DEMO_BOARD.id);
        await waitFor(peer, (frame) => frame.event === 'snapshot');
        await createCard(DEMO_COLUMN, 'Resync me');
        await waitFor(peer, (frame) => frame.event === 'card-created');

        peer.send('resync', undefined);
        await waitFor(peer, () => peer.frames.filter((frame) => frame.event === 'snapshot').length >= 2);
        const snapshots = peer.frames.filter((frame) => frame.event === 'snapshot');
        expect(BoardSnapshotSchema.parse(snapshots[1]?.data).columns.flatMap((column) => column.cards)).toContainEqual(
            expect.objectContaining({ title: 'Resync me' })
        );

        peer.send('nope', {});
        const unknown = await waitFor(
            peer,
            (frame) =>
                frame.event === 'error' &&
                z.object({ reason: z.string() }).parse(frame.data).reason.startsWith('unknown')
        );
        expect(z.object({ reason: z.string() }).parse(unknown.data).reason).toContain('nope');

        peer.sendRaw('not json at all');
        await waitFor(
            peer,
            (frame) =>
                frame.event === 'error' &&
                z.object({ reason: z.string() }).parse(frame.data).reason === 'malformed frame'
        );
    });

    test('an unknown board is refused with 1008', async () => {
        const peer = await join('does-not-exist');
        expect(await peer.closed).toBe(1008);
        expect(peer.frames).toHaveLength(0);
    });

    test('a bad board id is refused with 1008 before any snapshot', async () => {
        const peer = await join('bad%20id');
        expect(await peer.closed).toBe(1008);
        expect(peer.frames).toHaveLength(0);
    });
});
