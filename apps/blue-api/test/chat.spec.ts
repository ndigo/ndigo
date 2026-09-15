/**
 * End-to-end WebSocket demo gate (AD-21): the blue-api chat room.
 *
 * Boots the real application stack (auto-config + app config) on an
 * ephemeral port, connects real `ws` clients to `/ws/chat`, and asserts
 * the room fan-out plus the scheduler-driven `chat-tick` (scheduler →
 * registry reachability, AD-21 D4).
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type { ApplicationContext } from '@blue/context';
import { ApplicationBuilder } from '@blue/boot';
import { ManagementAutoConfiguration } from '@blue/management';
import { NodeAutoConfiguration, HTTPServer } from '@blue/platform-node';
import { NodeAppConfiguration } from '../src/node-app-configuration';
import { ServerConfig } from '../src/server-config';
import { initAuth } from '../src/auth-store';
import { WebSocket } from 'ws';

/**
 * Resolves once the first message matching `predicate` arrives.
 *
 * @param ws - The client socket.
 * @param predicate - Match predicate over parsed messages.
 * @param timeoutMs - Fail the wait after this many milliseconds.
 * @returns The matching parsed message.
 */
function waitFor<T>(ws: WebSocket, predicate: (message: T) => boolean, timeoutMs: number): Promise<T> {
    const { promise, resolve, reject } = Promise.withResolvers<T>();
    function onMessage(data: unknown): void {
        const parsed = JSON.parse(String(data)) as T;
        if (predicate(parsed)) {
            cleanup();
            resolve(parsed);
        }
    }
    function cleanup(): void {
        clearTimeout(timer);
        ws.off('message', onMessage);
    }
    const timer = setTimeout(() => {
        cleanup();
        reject(new Error('timed out waiting for a matching WebSocket message'));
    }, timeoutMs);
    ws.on('message', onMessage);
    return promise;
}

describe('blue-api WebSocket chat room (AD-21 demo gate)', () => {
    let context: ApplicationContext;
    let wsUrl: string;
    const clients: WebSocket[] = [];

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

    const open = (): Promise<WebSocket> => {
        const ws = new WebSocket(`${wsUrl}/ws/chat`);
        const { promise, resolve, reject } = Promise.withResolvers<WebSocket>();
        ws.once('open', () => resolve(ws));
        ws.once('error', reject);
        return promise.then((opened) => {
            clients.push(opened);
            return opened;
        });
    };

    test('a message sent by one client is broadcast to the whole room', async () => {
        const a = await open();
        const b = await open();

        // Both clients joined the `room` group before messaging; the sender
        // also receives its own message (room echo semantics).
        const deliveredA = waitFor<{ event: string; data: string }>(a, (m) => m.event === 'chat', 5_000);
        const deliveredB = waitFor<{ event: string; data: string }>(b, (m) => m.event === 'chat', 5_000);
        a.send('hello room');

        expect(await deliveredA).toEqual({ event: 'chat', data: 'hello room' });
        expect(await deliveredB).toEqual({ event: 'chat', data: 'hello room' });
    });

    test('the scheduler pushes a periodic chat-tick into the room', async () => {
        const c = await open();
        const tick = waitFor<{ event: string }>(c, (m) => m.event === 'chat-tick', 10_000);
        expect(await tick).toMatchObject({ event: 'chat-tick' });
    });
});
