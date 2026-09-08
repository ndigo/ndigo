// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { MetadataConfigApplicationContext } from '@blue/context';
import { getMapping, socketMapping, type SocketSession, requestMapping } from '@blue/dispatcher';
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
    async *echo(session: SocketSession) {
        for await (const message of session.messages) {
            yield { event: 'echo', data: message };
        }
    }

    // Query-conditioned endpoint: only upgrades carrying ?token=abc match
    // (the standard queryParams condition applied to a socket mapping, so the
    // original mapping-condition API is reused for WebSocket upgrades).
    @socketMapping({ value: '/room', queryParams: 'token=abc', private: false })
    async *room(session: SocketSession) {
        for await (const message of session.messages) {
            yield {
                event: 'room',
                data: { token: String(session.query['token']), auth: String(session.headers['x-auth'] ?? ''), text: String(message) },
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
        const ws = new WebSocket(`${wsUrl}/room?token=abc`, { headers: { 'x-auth': 'yes' } });
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
        expect(parsed).toEqual({ event: 'room', data: { token: 'abc', auth: 'yes', text: 'hello room' } });
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