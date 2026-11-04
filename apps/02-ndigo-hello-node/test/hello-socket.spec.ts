/**
 * WebSocket echo regression — found by the repo-level `apps:smoke` boot probe:
 * without `@parameters({ session: socketSessionValue('session') })` the handler
 * runs with `undefined`, the session access throws, and the server closes the
 * connection with 1011 before any echo. The suite boots the real server stack
 * on an ephemeral port and drives `/echo` over the node global WHATWG
 * `WebSocket` — the same wire a browser uses.
 * @module ndigo-hello-node
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { ApplicationBuilder } from '@ndigo/boot';
import type { ApplicationContext } from '@ndigo/context';
import { HTTP_SERVER, NodeAutoConfiguration, type HTTPServer } from '@ndigo/platform-node';
import { HelloConfiguration } from '../src/hello-configuration';

describe('ndigo-hello-node WebSocket echo', () => {
    let context: ApplicationContext;
    let base: string;

    beforeAll(async () => {
        process.env['PORT'] = '0'; // ephemeral port for the real http server
        context = await new ApplicationBuilder([NodeAutoConfiguration, HelloConfiguration])
            .properties({ 'server.port': '0', 'server.name': 'hello-node-spec' })
            .run();

        const server = context.getValue<HTTPServer>(HTTP_SERVER);
        await server.start();
        const bound = server.server as { address: () => { port: number } | null };
        base = `ws://127.0.0.1:${bound.address()?.port}`;
    }, 30_000);

    afterAll(() => {
        context.close();
        delete process.env['PORT'];
    });

    test('a message sent to /echo round-trips as an `echo` event', async () => {
        const socket = new WebSocket(`${base}/echo`);
        await new Promise<void>((resolve, reject) => {
            socket.addEventListener('open', () => resolve(), { once: true });
            socket.addEventListener('error', () => reject(new Error('socket failed to open')), { once: true });
        });

        const event = await new Promise<MessageEvent>((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('no echo within 5s')), 5_000);
            socket.addEventListener(
                'message',
                (message) => {
                    clearTimeout(timer);
                    resolve(message);
                },
                { once: true }
            );
            socket.send('{"smoke":"regression"}');
        });
        expect(JSON.parse(String(event.data))).toEqual({ event: 'echo', data: '{"smoke":"regression"}' });
        socket.close(1000);
    }, 15_000);
});
