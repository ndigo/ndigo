/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterAll, describe, expect, test } from 'vitest';
import { MetadataConfigApplicationContext } from '@blue/context';
import { parameters, requestMapping, socketMapping, socketSession, type SocketSession } from '@blue/dispatcher';
import { NodeAutoConfiguration } from '../src/node-auto-configuration';
import { NodeDispatcher } from '../src/node-dispatcher';
import { HTTPServer } from '../src/http-server';
import { NodeSocketSessionRegistry, resolveSocketRegistryOptions } from '../src/index';
import { WebSocket } from 'ws';

describe('resolveSocketRegistryOptions', () => {
    test('defaults when unset', () => {
        expect(resolveSocketRegistryOptions({})).toEqual({});
        expect(resolveSocketRegistryOptions({ BLUE_SOCKET_HEARTBEAT_INTERVAL_MS: '' })).toEqual({});
    });

    test('reads explicit values', () => {
        expect(
            resolveSocketRegistryOptions({ BLUE_SOCKET_HEARTBEAT_INTERVAL_MS: '5000', BLUE_SOCKET_IDLE_TIMEOUT_MS: '15000' })
        ).toEqual({ heartbeatIntervalMs: 5000, idleTimeoutMs: 15000 });
    });

    test('heartbeat 0 disables the heartbeat explicitly (AD-21 D6)', () => {
        expect(resolveSocketRegistryOptions({ BLUE_SOCKET_HEARTBEAT_INTERVAL_MS: '0' })).toEqual({
            heartbeatIntervalMs: null,
        });
    });

    test('invalid values fail fast', () => {
        expect(() => resolveSocketRegistryOptions({ BLUE_SOCKET_HEARTBEAT_INTERVAL_MS: '-1' })).toThrow(RangeError);
        expect(() => resolveSocketRegistryOptions({ BLUE_SOCKET_HEARTBEAT_INTERVAL_MS: 'abc' })).toThrow(RangeError);
        expect(() => resolveSocketRegistryOptions({ BLUE_SOCKET_IDLE_TIMEOUT_MS: '0' })).toThrow(RangeError);
        expect(() => resolveSocketRegistryOptions({ BLUE_SOCKET_IDLE_TIMEOUT_MS: '1.5' })).toThrow(RangeError);
    });
});

@requestMapping('/')
class BeanSocketController {
    @socketMapping('/echo')
    @parameters({ session: socketSession('session') })
    async *echo(session: SocketSession) {
        for await (const message of session.messages) {
            yield { event: 'echo', data: message };
        }
    }
}

describe('socket auto-configuration wiring (AD-21 D4)', () => {
    const context = new MetadataConfigApplicationContext('ws-bean-wiring');
    let server: HTTPServer;
    let wsUrl: string;

    afterAll(async () => {
        await server?.close();
        await context.close();
    });

    test('registry bean and the server adapter share one instance', async () => {
        context.register(NodeAutoConfiguration);
        context.setValue(BeanSocketController.name, new BeanSocketController());
        context.refresh();

        const bean = context.getValue<NodeSocketSessionRegistry>('socketSessionRegistry');
        expect(bean).toBeInstanceOf(NodeSocketSessionRegistry);

        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        server = new HTTPServer(dispatcher, { port: 0 });
        server.setApplicationContext(context);
        await server.start();

        const bound = server.server as { address: () => { port: number } | null };
        wsUrl = `ws://127.0.0.1:${bound.address()?.port}`;

        const ws = new WebSocket(`${wsUrl}/echo`);
        const opened = new Promise<void>((resolve, reject) => {
            ws.on('open', resolve);
            ws.on('error', reject);
        });
        await opened;

        // Push through the *bean* — reaches the adapter's session only if
        // both sides hold the same registry instance.
        const received = new Promise<unknown>((resolve) => {
            ws.once('message', (data: unknown) => resolve(JSON.parse(String(data))));
        });
        bean.broadcast('/echo', { event: 'server', data: 'via-bean' });
        await expect(received).resolves.toEqual({ event: 'server', data: 'via-bean' });
        expect(bean.count('/echo')).toBe(1);
        ws.close(1000, 'done');
    });
});