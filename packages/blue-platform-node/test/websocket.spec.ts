// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { MetadataConfigApplicationContext } from '@blue/context';
import {
    getMapping,
    requestMapping,
    socketMapping,
    parameters,
    socketSession,
    queryValue,
    headerValue,
    type SocketSession,
} from '@blue/dispatcher';
import { NodeAutoConfiguration } from '../src/node-auto-configuration';
import { NodeDispatcher } from '../src/node-dispatcher';
import { NodeHTTPServerAdapter } from '../src/node-http-server-adapter';
import { HTTPServer } from '../src/http-server';
import { WebSocket } from 'ws';

/**
 * End-to-end WebSocket integration through the Node pipeline:
 * context → NodeAutoConfiguration → NodeDispatcher → adapter → RFC 6455.
 *
 * Boots a real `node:http` server with the adapter's WebSocketServer
 * upgrade listener, connects a real `ws` client, and asserts the socket
 * handler receive/send contract.
 */

@requestMapping('/')
class SocketController {
    @getMapping('/')
    greet() {
        return { message: 'Hello, Socket!' };
    }

    @socketMapping('/echo')
    @parameters({ session: socketSession('session') })
    async *echo(session: SocketSession) {
        for await (const message of session.messages) {
            yield { event: 'echo', data: message };
        }
    }

    // @parameters on a socket: bound from the upgrade sources into
    // session.params (query/header), gated by the query condition.
    @socketMapping({ value: '/room', queryParams: 'token=abc', private: false })
    @parameters({
        session: socketSession('session'),
        token: queryValue('token'),
        via: headerValue('x-via'),
    })
    async *room(session: SocketSession, token: string, via: string) {
        for await (const message of session.messages) {
            yield {
                event: 'room',
                data: { token: String(token), via: String(via), text: String(message) },
            };
        }
    }
}

describe('Node WebSocket pipeline', () => {
    let context: MetadataConfigApplicationContext;
    let server: HTTPServer;
    let httpBase: string;
    let wsUrl: string;

    beforeAll(async () => {
        context = new MetadataConfigApplicationContext('ws-integration');
        context.register(NodeAutoConfiguration);
        context.setValue(SocketController.name, new SocketController());
        context.refresh();

        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        const adapter = new NodeHTTPServerAdapter(dispatcher);
        await adapter.listen(0, '127.0.0.1');
        const boundPort = (
            adapter.server as unknown as {
                address: () => { port: number } | null;
            }
        ).address()?.port;
        httpBase = `http://127.0.0.1:${boundPort}`;
        wsUrl = `ws://127.0.0.1:${boundPort}`;

        server = new HTTPServer(dispatcher, { adapter });
    });

    afterAll(async () => {
        await server?.close();
    });

    test('regular HTTP still works on a socket-enabled server', async () => {
        const res = await fetch(`${httpBase}/`);
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ message: 'Hello, Socket!' });
    });

    test('a plain GET to a socket path is not upgraded (no WS handshake)', async () => {
        const res = await fetch(`${httpBase}/echo`);
        // No Upgrade header → the request is a normal HTTP request; no socket
        // handler matches GET, so it is 404/405, never a 101 Upgrade.
        expect([400, 404, 405]).toContain(res.status);
    });

    test('WebSocket upgrade at /echo echoes a message back', async () => {
        const ws = new WebSocket(`${wsUrl}/echo`);
        const opened = new Promise<void>((resolve, reject) => {
            ws.on('open', () => resolve());
            ws.on('error', reject);
        });
        await opened;

        const received = new Promise<unknown>((resolve) => {
            ws.once('message', (data: unknown) => resolve(data));
        });
        ws.send('ping');

        const reply = await received;
        expect(JSON.parse(String(reply))).toEqual({ event: 'echo', data: 'ping' });
        ws.close(1000, 'done');
    });

    test('unknown socket path refuses the handshake', async () => {
        const ws = new WebSocket(`${wsUrl}/nope`);
        let failed = false;
        ws.on('error', () => {
            failed = true;
        });
        // Allow a brief window for the refusal; the socket must not open.
        await new Promise<void>((resolve) => {
            setTimeout(resolve, 300);
        });
        expect(failed).toBe(true);
    });

    test('queryParams condition gates a socket upgrade (original mapping API reused)', async () => {
        const ws = new WebSocket(`${wsUrl}/room?token=abc`, { headers: { 'x-via': 'ws-client' } });
        const opened = new Promise<void>((resolve, reject) => {
            ws.on('open', () => resolve());
            ws.on('error', reject);
        });
        await opened;

        const received = new Promise<unknown>((resolve) => {
            ws.once('message', (data: unknown) => resolve(data));
        });
        ws.send('hello room');

        const reply = await received;
        const parsed = JSON.parse(String(reply));
        // @parameters bound from the upgrade sources into session.params.
        expect(parsed).toEqual({ event: 'room', data: { token: 'abc', via: 'ws-client', text: 'hello room' } });
        ws.close(1000, 'done');
    });

    test('wrong query token fails the socket handshake (condition does not match)', async () => {
        const ws = new WebSocket(`${wsUrl}/room?token=wrong`);
        let failed = false;
        ws.on('open', () => {
            failed = false;
        });
        ws.on('error', () => {
            failed = true;
        });
        await new Promise<void>((resolve) => {
            setTimeout(resolve, 300);
        });
        // Either the handshake errors (refused) or never opens — the socket
        // must not be usable.
        expect(failed).toBe(true);
    });
});

describe('WebSocket origin enforcement', () => {
    let originServer: HTTPServer;
    let originWsUrl: string;

    beforeAll(async () => {
        const originContext = new MetadataConfigApplicationContext('ws-origin');
        originContext.register(NodeAutoConfiguration);
        originContext.setValue(SocketController.name, new SocketController());
        originContext.refresh();
        const dispatcher = originContext.getValue<NodeDispatcher>('dispatcher');
        const adapter = new NodeHTTPServerAdapter(dispatcher, {
            allowedWebSocketOrigins: ['http://127.0.0.1:9999'],
        });
        await adapter.listen(0, '127.0.0.1');
        // adapter.server is `unknown` by contract; the http server's
        // address() is the only shape offered here.
        const boundAddress = adapter.server as { address: () => { port: number } | null };
        const boundPort = boundAddress.address()?.port;
        originWsUrl = `ws://127.0.0.1:${boundPort}`;
        originServer = new HTTPServer(dispatcher, { adapter });
    });

    afterAll(async () => {
        await originServer?.close();
    });

    test('an allowlisted Origin upgrades normally', async () => {
        const ws = new WebSocket(`${originWsUrl}/echo`, { origin: 'http://127.0.0.1:9999' });
        const { promise: opened, resolve, reject } = Promise.withResolvers<void>();
        ws.on('open', resolve);
        ws.on('error', reject);
        await opened;

        const received = new Promise<unknown>((resolve) => {
            ws.once('message', (data: unknown) => resolve(data));
        });
        ws.send('ping');

        const reply = await received;
        expect(JSON.parse(String(reply))).toEqual({ event: 'echo', data: 'ping' });
        ws.close(1000, 'done');
    });

    test('a forged Origin is rejected with 403 before the connection fires', async () => {
        const ws = new WebSocket(`${originWsUrl}/echo`, { headers: { origin: 'https://evil.example' } });
        let failed = false;
        ws.on('error', () => {
            failed = true;
        });
        const { promise, resolve } = Promise.withResolvers<void>();
        setTimeout(resolve, 400);
        await promise;
        expect(failed).toBe(true);
    });

    test('a missing Origin fails closed when the allowlist is configured', async () => {
        const ws = new WebSocket(`${originWsUrl}/echo`);
        let failed = false;
        ws.on('error', () => {
            failed = true;
        });
        const { promise, resolve } = Promise.withResolvers<void>();
        setTimeout(resolve, 400);
        await promise;
        expect(failed).toBe(true);
    });

    test('invalid allowedWebSocketOrigins entries are rejected at construction', () => {
        const context = new MetadataConfigApplicationContext('ws-origin-invalid');
        context.register(NodeAutoConfiguration);
        context.refresh();
        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        expect(
            () => new NodeHTTPServerAdapter(dispatcher, { allowedWebSocketOrigins: ['https://x.example/path'] })
        ).toThrow(RangeError);
        expect(() => new NodeHTTPServerAdapter(dispatcher, { allowedWebSocketOrigins: ['not-a-url'] })).toThrow(
            RangeError
        );
    });
});
