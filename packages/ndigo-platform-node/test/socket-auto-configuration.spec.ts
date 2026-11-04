/**
 * @module ndigo-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterAll, describe, expect, test } from 'vitest';
import { MetadataConfigApplicationContext } from '@ndigo/context';
import { parameters, requestMapping, socketMapping, socketSessionValue, type SocketSession } from '@ndigo/dispatcher';
import { NodeAutoConfiguration } from '../src/node-auto-configuration';
import { NodeDispatcher } from '../src/node-dispatcher';
import { HTTPServer } from '../src/http-server';
import { NodeSocketSessionRegistry, resolveSocketRegistryOptions } from '../src/index';
import { resolveSocketLimits } from '../src/node-socket-session';
import { WebSocket } from 'ws';

describe('resolveSocketRegistryOptions', () => {
    test('defaults when unset', () => {
        expect(resolveSocketRegistryOptions({})).toEqual({});
        expect(resolveSocketRegistryOptions({ NDIGO_SOCKET_HEARTBEAT_INTERVAL_MS: '' })).toEqual({});
    });

    test('reads explicit values', () => {
        expect(
            resolveSocketRegistryOptions({
                NDIGO_SOCKET_HEARTBEAT_INTERVAL_MS: '5000',
                NDIGO_SOCKET_IDLE_TIMEOUT_MS: '15000',
            })
        ).toEqual({ heartbeatIntervalMs: 5000, idleTimeoutMs: 15000 });
    });

    test('heartbeat 0 disables the heartbeat explicitly (AD-21 D6)', () => {
        expect(resolveSocketRegistryOptions({ NDIGO_SOCKET_HEARTBEAT_INTERVAL_MS: '0' })).toEqual({
            heartbeatIntervalMs: null,
        });
    });

    test('invalid values fail fast', () => {
        expect(() => resolveSocketRegistryOptions({ NDIGO_SOCKET_HEARTBEAT_INTERVAL_MS: '-1' })).toThrow(RangeError);
        expect(() => resolveSocketRegistryOptions({ NDIGO_SOCKET_HEARTBEAT_INTERVAL_MS: 'abc' })).toThrow(RangeError);
        expect(() => resolveSocketRegistryOptions({ NDIGO_SOCKET_IDLE_TIMEOUT_MS: '0' })).toThrow(RangeError);
        expect(() => resolveSocketRegistryOptions({ NDIGO_SOCKET_IDLE_TIMEOUT_MS: '1.5' })).toThrow(RangeError);
        // Non-decimal numeric forms must not silently coerce (O1).
        expect(() => resolveSocketRegistryOptions({ NDIGO_SOCKET_HEARTBEAT_INTERVAL_MS: '0x10' })).toThrow(RangeError);
        expect(() => resolveSocketRegistryOptions({ NDIGO_SOCKET_IDLE_TIMEOUT_MS: '1e3' })).toThrow(RangeError);
    });
});

describe('resolveSocketLimits', () => {
    test('defaults when unset', () => {
        expect(resolveSocketLimits({}, {})).toEqual({
            maxPayloadBytes: 1_048_576,
            maxQueuedMessages: 1024,
            maxQueuedBytes: 4_194_304,
            maxBufferedBytes: 1_048_576,
            onOverflow: 'close',
        });
        expect(resolveSocketLimits({}, { NDIGO_SOCKET_MAX_PAYLOAD_BYTES: '' })).toEqual({
            maxPayloadBytes: 1_048_576,
            maxQueuedMessages: 1024,
            maxQueuedBytes: 4_194_304,
            maxBufferedBytes: 1_048_576,
            onOverflow: 'close',
        });
    });

    test('reads explicit values over environment', () => {
        expect(
            resolveSocketLimits(
                { maxPayloadBytes: 512, maxQueuedMessages: 8 },
                { NDIGO_SOCKET_MAX_PAYLOAD_BYTES: '999999' }
            )
        ).toEqual({
            maxPayloadBytes: 512,
            maxQueuedMessages: 8,
            maxQueuedBytes: 4_194_304,
            maxBufferedBytes: 1_048_576,
            onOverflow: 'close',
        });
        expect(resolveSocketLimits({}, { NDIGO_SOCKET_MAX_PAYLOAD_BYTES: '2048' })).toEqual({
            maxPayloadBytes: 2048,
            maxQueuedMessages: 1024,
            maxQueuedBytes: 4_194_304,
            maxBufferedBytes: 1_048_576,
            onOverflow: 'close',
        });
    });

    test('rejects non-decimal and non-positive values', () => {
        expect(() => resolveSocketLimits({}, { NDIGO_SOCKET_MAX_PAYLOAD_BYTES: '0x10' })).toThrow(RangeError);
        expect(() => resolveSocketLimits({}, { NDIGO_SOCKET_MAX_QUEUED_MESSAGES: '1e3' })).toThrow(RangeError);
        expect(() => resolveSocketLimits({ maxPayloadBytes: 0 })).toThrow(RangeError);
        expect(() => resolveSocketLimits({ maxQueuedMessages: -1 })).toThrow(RangeError);
    });

    test('HTTPServer rejects adapter + socketRegistry together (O7)', () => {
        // A custom adapter owns its registry; silently accepting both would
        // leave the context bean and the adapter's registry disjoint.
        const dispatcher = {} as unknown as NodeDispatcher;
        const adapter = {} as unknown as HTTPServer['server'];
        expect(
            () =>
                new HTTPServer(dispatcher, {
                    adapter: adapter as never,
                    socketRegistry: new NodeSocketSessionRegistry(),
                })
        ).toThrow(RangeError);
    });
});

@requestMapping('/')
class BeanSocketController {
    @socketMapping('/echo')
    @parameters({ session: socketSessionValue('session') })
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
        context.close();
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
        await bean.broadcast('/echo', { event: 'server', data: 'via-bean' });
        expect(await received).toEqual({ event: 'server', data: 'via-bean' });
        expect(bean.count('/echo')).toBe(1);
        ws.close(1000, 'done');
    });
});
