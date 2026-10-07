/**
 * Single-node socket lane: the real server boots **without Redis**, two
 * `@blue/socket` clients connect to `/ws/board`, and the board's local
 * semantics are asserted — room echo to every connected client, and the
 * scripted `POST /board` route reaching the same sockets.
 *
 * This is the documented fallback the app promises when `BLUE_REDIS_URL` is
 * absent: identical routes, identical payloads, delivery bounded to this
 * process's sessions.
 * @module blue-redis-fanout
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { ApplicationBuilder } from '@blue/boot';
import type { ApplicationContext } from '@blue/context';
import { ManagementAutoConfiguration } from '@blue/management';
import { HTTP_SERVER, NodeAutoConfiguration, type HTTPServer } from '@blue/platform-node';
import { WebSocketClient } from '@blue/socket';
import { BOARD_PATH, BOARD_TEXT_MAX } from '../src/board-message';
import { FANOUT_BACKEND } from '../src/fanout-backend';
import { RedisFanoutConfiguration } from '../src/redis-fanout-configuration';
import { collectMessages, waitForMessage, waitForOpen, type CollectedMessages } from './socket-client-helpers';
import { BoardErrorDoc, BoardMessageDoc, BoardPostDoc } from './wire-schemas';

/** The instance id this lane's process reports. */
const INSTANCE = 'node-solo';
/** How long a lane waits for a message before failing (generous: CI machines). */
const TIMEOUT_MS = 10_000;

/** One connected client and its drained message stream. */
interface Connected {
    readonly client: WebSocketClient;
    readonly collected: CollectedMessages;
}

describe('redis-fanout board (no Redis: this node only)', () => {
    let context: ApplicationContext;
    let server: HTTPServer;
    let origin: string;
    const clients: WebSocketClient[] = [];
    /** The variables this lane overrides, captured for exact restoration. */
    const savedEnv: Record<string, string | undefined> = {
        BLUE_REDIS_URL: process.env['BLUE_REDIS_URL'],
        BLUE_INSTANCE_ID: process.env['BLUE_INSTANCE_ID'],
        PORT: process.env['PORT'],
    };

    beforeAll(async () => {
        delete process.env['BLUE_REDIS_URL'];
        process.env['BLUE_INSTANCE_ID'] = INSTANCE;
        process.env['PORT'] = '0'; // ephemeral port for the real server
        context = await new ApplicationBuilder([
            NodeAutoConfiguration,
            ManagementAutoConfiguration,
            RedisFanoutConfiguration,
        ]).run();
        await context.getValue(FANOUT_BACKEND).connect();
        server = context.getValue(HTTP_SERVER);
        await server.start();
        // `HTTPServer.server` is the adapter's server, `unknown` on the shared contract.
        const bound = server.server as { address: () => { port: number } | null };
        origin = `127.0.0.1:${bound.address()?.port}`;
    }, 30_000);

    afterAll(async () => {
        for (const client of clients) {
            client.close(1000, 'spec done');
        }
        await server.close();
        await context.getValue(FANOUT_BACKEND).close();
        context.close();
        for (const [name, value] of Object.entries(savedEnv)) {
            if (value === undefined) {
                delete process.env[name];
            } else {
                process.env[name] = value;
            }
        }
    });

    const connect = async (): Promise<Connected> => {
        const client = new WebSocketClient(`ws://${origin}${BOARD_PATH}`, { reconnect: null });
        clients.push(client);
        await waitForOpen(client, TIMEOUT_MS);
        return { client, collected: collectMessages(client) };
    };

    /** Posts to the scripted route and parses the `202` document. */
    const post = async (text: string) => {
        const res = await fetch(`http://${origin}/board`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ text }),
        });
        expect(res.status).toBe(202);
        return BoardPostDoc.parse(await res.json());
    };

    test('a message sent by one client is broadcast to every client on the node', async () => {
        const a = await connect();
        const b = await connect();

        a.client.send('hello board');

        const atA = BoardMessageDoc.parse(
            await waitForMessage(a.collected, (m) => m['event'] === 'board-message', TIMEOUT_MS)
        );
        const atB = BoardMessageDoc.parse(
            await waitForMessage(b.collected, (m) => m['event'] === 'board-message', TIMEOUT_MS)
        );
        expect(atA).toMatchObject({ text: 'hello board', from: INSTANCE });
        expect(atB).toEqual(atA);
    });

    test('POST /board reaches clients that never sent anything (join happens on connect)', async () => {
        const fresh = await connect();
        const doc = await post('from the HTTP route');

        expect(doc.posted).toMatchObject({ text: 'from the HTTP route', from: INSTANCE });
        expect(doc.mode).toBe('memory');
        expect(doc.localClients).toBeGreaterThan(0);

        const received = BoardMessageDoc.parse(
            await waitForMessage(fresh.collected, (m) => m['text'] === 'from the HTTP route', TIMEOUT_MS)
        );
        expect(received).toMatchObject({ from: INSTANCE });
    });

    test('empty and oversized texts are refused to the sender and never fanned out', async () => {
        const sender = await connect();
        const other = await connect();

        sender.client.send('');
        sender.client.send('x'.repeat(BOARD_TEXT_MAX + 1));
        // The follow-up is queued behind both refusals on the same connection,
        // so its echo is ordered proof that the invalid frames were handled and
        // never broadcast.
        sender.client.send('still working');

        await waitForMessage(other.collected, (m) => m['text'] === 'still working', TIMEOUT_MS);
        await waitForMessage(sender.collected, (m) => m['text'] === 'still working', TIMEOUT_MS);

        const refusals = sender.collected.messages
            .filter((m) => m['event'] === 'board-error')
            .map((m) => BoardErrorDoc.parse(m));
        expect(refusals).toHaveLength(2);
        expect(refusals[0]?.detail).toContain(String(BOARD_TEXT_MAX));
        expect(texts(sender.collected)).toEqual(['still working']);
        expect(texts(other.collected)).toEqual(['still working']);
    });
});

/**
 * The board texts a client received, in arrival order.
 *
 * @param collected - The drained client.
 * @returns The `board-message` texts only.
 */
function texts(collected: CollectedMessages): string[] {
    return collected.messages.filter((m) => m['event'] === 'board-message').map((m) => BoardMessageDoc.parse(m).text);
}
