/**
 * End-to-end room socket gates: the real application stack booted on an
 * ephemeral port, driven by the Node global WHATWG `WebSocket` — history replay
 * on join, room isolation, presence join/leave, and reconnect (re-join + replay
 * without duplicates).
 * @module ndigo-chat
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { ApplicationBuilder } from '@ndigo/boot';
import { HTTP_SERVER, NodeAutoConfiguration, type HTTPServer } from '@ndigo/platform-node';
import { ChatConfiguration } from '../src/chat-configuration';

/** One received frame (the documented envelope). */
interface Frame {
    event: string;
    data: unknown;
    at: number;
    from: string;
}

/** A live test peer draining its socket into a frame array. */
interface Peer {
    readonly frames: Frame[];
    send(event: string, data: unknown): void;
    close(): void;
}

/**
 * Opens a WebSocket peer and starts collecting parsed frames.
 *
 * @param url - The socket URL.
 * @returns The peer, once the connection is open.
 */
async function connect(url: string): Promise<Peer> {
    const ws = new WebSocket(url);
    const frames: Frame[] = [];
    ws.onmessage = (event) => {
        if (typeof event.data !== 'string') {
            return;
        }
        try {
            frames.push(JSON.parse(event.data) as Frame);
        } catch {
            // Not a JSON frame; ignore.
        }
    };
    await new Promise<void>((resolve, reject) => {
        ws.onopen = () => resolve();
        ws.onerror = () => reject(new Error(`socket refused: ${url}`));
    });
    return {
        frames,
        send(event, data) {
            ws.send(JSON.stringify({ event, data }));
        },
        close() {
            ws.close(1000, 'spec');
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

describe('ndigo-chat room sockets', () => {
    let context: Awaited<ReturnType<ApplicationBuilder['run']>>;
    let base: string;
    const peers: Peer[] = [];

    beforeAll(async () => {
        process.env['PORT'] = '0';
        context = await new ApplicationBuilder([NodeAutoConfiguration, ChatConfiguration])
            .properties({ 'server.port': '0', 'server.name': 'chat-spec' })
            .run();
        const server = context.getValue<HTTPServer>(HTTP_SERVER);
        await server.start();
        const bound = server.server as { address: () => { port: number } | null };
        base = `ws://127.0.0.1:${bound.address()?.port}`;
    }, 30_000);

    afterAll(async () => {
        for (const peer of peers) {
            peer.close();
        }
        // Let each handler's leave broadcast land before the registry closes.
        await new Promise<void>((resolve) => setTimeout(resolve, 75));
        context.close();
        delete process.env['PORT'];
    });

    /** Connects a peer to a room and tracks it for teardown. */
    const join = async (room: string, user: string, path = 'ws/rooms'): Promise<Peer> => {
        const peer = await connect(`${base}/${path}/${room}?user=${user}`);
        peers.push(peer);
        return peer;
    };

    test('a newcomer receives the room history replayed on join', async () => {
        const room = 'history';
        const first = await join(room, 'Ada');
        await waitFor(first, (frame) => frame.event === 'history');
        first.send('message', 'first message');
        await waitFor(first, (frame) => frame.event === 'message');

        const late = await join(room, 'Grace');
        const history = await waitFor(late, (frame) => frame.event === 'history');
        const messages = (history.data as { messages: Array<{ text: string; from: string }> }).messages;
        expect(messages.map((message) => message.text)).toEqual(['first message']);
        expect(messages[0]?.from).toBe('Ada');
    });

    test('a message in one room never reaches another room', async () => {
        const speaker = await join('alpha', 'Ann');
        const sameRoom = await join('alpha', 'Al');
        const otherRoom = await join('beta', 'Bea');

        await waitFor(otherRoom, (frame) => frame.event === 'presence');
        speaker.send('message', 'alpha only');

        // The same-room peer proves the fan-out happened before we assert absence.
        await waitFor(sameRoom, (frame) => frame.event === 'message' && frame.from === 'Ann');
        expect(otherRoom.frames.some((frame) => frame.event === 'message')).toBe(false);
        expect(otherRoom.frames.every((frame) => frame.from === 'server')).toBe(true);
    });

    test('presence announces joins and leaves with the roster', async () => {
        const room = 'presence';
        const alice = await join(room, 'Alice');
        const joinedAlice = await waitFor(
            alice,
            (frame) => frame.event === 'presence' && 'joined' in (frame.data as object)
        );
        expect((joinedAlice.data as { users: string[]; joined: string }).users).toEqual(['Alice']);

        const bob = await join(room, 'Bob');
        const bobJoin = await waitFor(
            alice,
            (frame) => frame.event === 'presence' && (frame.data as { joined?: string }).joined === 'Bob'
        );
        expect((bobJoin.data as { users: string[] }).users).toEqual(['Alice', 'Bob']);

        bob.close();
        const left = await waitFor(
            alice,
            (frame) => frame.event === 'presence' && (frame.data as { left?: string }).left === 'Bob'
        );
        expect((left.data as { users: string[] }).users).toEqual(['Alice']);
    });

    test('a reconnect re-joins the room and replays history without duplicates', async () => {
        const room = 'reconnect';
        const first = await join(room, 'Ash');
        await waitFor(first, (frame) => frame.event === 'history');
        first.send('message', 'one');
        first.send('message', 'two');
        await waitFor(first, (frame) => frame.event === 'message' && (frame.data as { text: string }).text === 'two');
        first.close();

        const second = await join(room, 'Ash');
        const history = await waitFor(second, (frame) => frame.event === 'history');
        const messages = (history.data as { messages: Array<{ id: string; text: string }> }).messages;
        expect(messages.map((message) => message.text)).toEqual(['one', 'two']);
        expect(new Set(messages.map((message) => message.id)).size).toBe(2);
    });

    test('a typing frame is relayed to the room, sender included', async () => {
        const room = 'typing';
        const ann = await join(room, 'Ann');
        const ben = await join(room, 'Ben');
        await waitFor(ben, (frame) => frame.event === 'presence');
        ann.send('typing', true);

        const typing = await waitFor(ben, (frame) => frame.event === 'typing');
        expect(typing.from).toBe('Ann');
        expect(typing.data).toBe(true);
        // Room-echo parity: the sender sees its own typing frame too.
        await waitFor(ann, (frame) => frame.event === 'typing' && frame.from === 'Ann');
    });
});
