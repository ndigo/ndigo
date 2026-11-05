/**
 * End-to-end WebSocket demo gate (AD-21/AD-22): the ndigo-api chat room
 * **consumed through the `@ndigo/socket` client** — the node global WHATWG
 * `WebSocket` transport, same wire as a browser.
 *
 * Boots the real application stack on an ephemeral port, connects
 * `WebSocketClient`s to `/ws/chat`, and asserts the room fan-out, the
 * scheduler-driven `chat-tick`, and deliberate-close status transitions
 * (AD-22 D3/D6).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type { ApplicationContext } from '@ndigo/context';
import { ApplicationBuilder } from '@ndigo/boot';
import { ManagementAutoConfiguration } from '@ndigo/management';
import { NodeAutoConfiguration, HTTPServer } from '@ndigo/platform-node';
import { WebSocketClient, type SocketClient } from '@ndigo/socket';
import { NodeAppConfiguration } from '../src/node-app-configuration';
import { ServerConfig } from '../src/server-config';
import { initAuth } from '../src/auth-store';

/**
 * Drains a client's message stream into an array (parsed as JSON objects).
 *
 * @param client - The client to consume.
 * @returns The collected messages and a promise completing on close.
 */
function collectMessages(client: SocketClient): { messages: Array<Record<string, unknown>>; done: Promise<void> } {
    const messages: Array<Record<string, unknown>> = [];
    const done = (async () => {
        for await (const message of client.messages) {
            messages.push(JSON.parse(String(message)) as Record<string, unknown>);
        }
    })();
    return { messages, done };
}

/**
 * Polls until the client reports `open`.
 *
 * @param client - The client.
 * @param timeoutMs - Fail the wait after this many milliseconds.
 */
function waitForOpen(client: SocketClient, timeoutMs: number): Promise<void> {
    const { promise, resolve, reject } = Promise.withResolvers<void>();
    const started = Date.now();
    const poll = (): void => {
        if (client.status.value === 'open') {
            resolve();
            return;
        }
        if (Date.now() - started > timeoutMs) {
            reject(new Error('socket did not open in time'));
            return;
        }
        setTimeout(poll, 25);
    };
    poll();
    return promise;
}

/**
 * Resolves once the first collected message matches `predicate`.
 *
 * @param messages - Collected messages (see {@link collectMessages}).
 * @param predicate - Match predicate.
 * @param timeoutMs - Fail the wait after this many milliseconds.
 * @returns The matching message.
 */
function waitFor(
    messages: readonly Record<string, unknown>[],
    predicate: (message: Record<string, unknown>) => boolean,
    timeoutMs: number
): Promise<Record<string, unknown>> {
    const { promise, resolve, reject } = Promise.withResolvers<Record<string, unknown>>();
    const started = Date.now();
    const poll = (): void => {
        const match = messages.find((message) => predicate(message));
        if (match !== undefined) {
            resolve(match);
            return;
        }
        if (Date.now() - started > timeoutMs) {
            reject(new Error(`timed out waiting for a matching WebSocket message (have ${messages.length})`));
            return;
        }
        setTimeout(poll, 25);
    };
    poll();
    return promise;
}

describe('ndigo-api WebSocket chat room via @ndigo/socket client (AD-22 D6)', () => {
    let context: ApplicationContext;
    let wsUrl: string;
    const clients: WebSocketClient[] = [];

    beforeAll(async () => {
        initAuth();
        process.env['PORT'] = '0'; // ephemeral port for the real http server
        context = await new ApplicationBuilder([
            NodeAutoConfiguration,
            ManagementAutoConfiguration,
            ServerConfig,
            NodeAppConfiguration,
        ])
            .properties({ 'server.port': '0', 'server.name': 'chat-spec' })
            .run();

        const server = context.getValue<HTTPServer>('httpServer');
        await server.start();
        const bound = server.server as { address: () => { port: number } | null };
        wsUrl = `ws://127.0.0.1:${bound.address()?.port}`;
    }, 30_000);

    afterAll(async () => {
        for (const client of clients) {
            client.close(1000, 'spec done');
        }
        context.close();
        delete process.env['PORT'];
    });

    const chat = (): WebSocketClient => {
        const client = new WebSocketClient(`${wsUrl}/ws/chat`, { reconnect: null });
        clients.push(client);
        return client;
    };

    test('a message sent by one client is broadcast to the whole room', async () => {
        const a = chat();
        const b = chat();
        await Promise.all([waitForOpen(a, 5_000), waitForOpen(b, 5_000)]);
        const receivedA = collectMessages(a);
        const receivedB = collectMessages(b);

        a.send('hello room');

        // Both clients joined the `room` group; the sender also receives its
        // own message (room echo semantics).
        const deliveredA = await waitFor(receivedA.messages, (m) => m.event === 'chat', 5_000);
        const deliveredB = await waitFor(receivedB.messages, (m) => m.event === 'chat', 5_000);
        expect(deliveredA).toEqual({ event: 'chat', data: 'hello room' });
        expect(deliveredB).toEqual({ event: 'chat', data: 'hello room' });
    });

    test('the scheduler pushes a periodic chat-tick into the room', async () => {
        const c = chat();
        await waitForOpen(c, 5_000);
        const received = collectMessages(c);
        const tick = await waitFor(received.messages, (m) => m.event === 'chat-tick', 10_000);
        expect(tick).toMatchObject({ event: 'chat-tick' });
    });

    test('client status transitions open → closed on deliberate close (AD-22 D3)', async () => {
        const d = chat();
        await waitForOpen(d, 5_000);
        expect(d.status.value).toBe('open');

        d.close(1000, 'done');
        expect(d.status.value).toBe('closed');

        const received = collectMessages(d);
        await received.done; // deliberate close completes the message stream
    });
});
