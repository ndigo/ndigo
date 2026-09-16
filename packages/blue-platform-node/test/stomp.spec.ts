/**
 * STOMP-over-WebSocket integration through the Node pipeline (AD-23):
 * subprotocol negotiation on `@stompMapping` paths, the broker's full
 * protocol loop over `ws` wire frames, SEND fan-out, receipts, and ERROR
 * + close on violations (server-initiated publish from outside the
 * handler). Non-STOMP socket paths keep the stock first-offered
 * subprotocol behavior.
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { MetadataConfigApplicationContext } from '@blue/context';
import {
    requestMapping,
    socketMapping,
    stompMapping,
    parameters,
    socketSession,
    type SocketSession,
} from '@blue/dispatcher';
import { StompBroker, parseStompFrame, serializeStompFrame, type StompFrame } from '@blue/socket';
import { NodeAutoConfiguration } from '../src/node-auto-configuration';
import { NodeDispatcher } from '../src/node-dispatcher';
import { NodeHTTPServerAdapter } from '../src/node-http-server-adapter';
import { HTTPServer } from '../src/http-server';
import { WebSocket } from 'ws';

/** Wire helper: serialize a STOMP frame for `ws.send`. */
const frame = (command: string, headers: Record<string, string> = {}, body = ''): string =>
    serializeStompFrame({ command, headers, body });

/** Await one WS message and parse it as a STOMP frame (text or binary). */
const waitFrame = (ws: WebSocket): Promise<StompFrame> => {
    const { promise, resolve } = Promise.withResolvers<StompFrame>();
    // ws v8 delivers Buffers with an `isBinary` flag: text frames must be
    // decoded to strings, binary frames parsed byte-exact (AD-23 D8).
    ws.once('message', (data: unknown, isBinary: boolean) => {
        if (isBinary) {
            // ws delivers Buffers; normalize to a plain Uint8Array so
            // byte-exact comparisons match the transport-independent type.
            resolve(parseStompFrame(Buffer.isBuffer(data) ? new Uint8Array(data as Buffer) : (data as Uint8Array)));
        } else {
            resolve(parseStompFrame(String(data)));
        }
    });
    return promise;
};

/** Poll until `predicate` holds (the e2e wait idiom). */
async function waitFor(predicate: () => boolean): Promise<void> {
    const deadline = Date.now() + 5_000;
    while (!predicate()) {
        if (Date.now() > deadline) {
            throw new Error('timed out waiting for STOMP condition');
        }
        // oxlint-disable-next-line no-await-in-loop -- each iteration re-reads the just-updated condition; batching would change the poll semantics.
        await new Promise<void>((resolve) => setTimeout(resolve, 20));
    }
}

@requestMapping('/')
class StompController {
    readonly broker = new StompBroker();

    @stompMapping('/stomp')
    @parameters({ session: socketSession('session') })
    async stomp(session: SocketSession) {
        await this.broker.handleSocket(session);
    }

    // A plain socket endpoint stays a plain socket endpoint: no STOMP
    // behavior is inferred, and the subprotocol negotiation must preserve
    // the stock echo-first behavior.
    @socketMapping('/plain')
    @parameters({ session: socketSession('session') })
    async *plain(session: SocketSession) {
        for await (const message of session.messages) {
            yield { event: 'plain', data: String(message) };
        }
    }
}

describe('STOMP over WebSocket (AD-23)', () => {
    let server: HTTPServer;
    let wsUrl: string;
    let controller: StompController;

    beforeAll(async () => {
        const context = new MetadataConfigApplicationContext('stomp-integration');
        context.register(NodeAutoConfiguration);
        controller = new StompController();
        context.setValue(StompController.name, controller);
        context.refresh();

        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        const adapter = new NodeHTTPServerAdapter(dispatcher);
        await adapter.listen(0, '127.0.0.1');
        const boundPort = (
            adapter.server as unknown as {
                address: () => { port: number } | null;
            }
        ).address()?.port;
        wsUrl = `ws://127.0.0.1:${boundPort}`;
        server = new HTTPServer(dispatcher, { adapter });
    });

    afterAll(async () => {
        await server?.close();
    });

    test('negotiates the v12.stomp subprotocol on a stomp-mapped path', async () => {
        const ws = new WebSocket(`${wsUrl}/stomp`, ['v10.stomp', 'v12.stomp']);
        const opened = new Promise<void>((resolve, reject) => {
            ws.on('open', () => resolve());
            ws.on('error', reject);
        });
        await opened;
        expect(ws.protocol).toBe('v12.stomp');
        ws.close(1000, 'done');
    });

    test('negotiates the best mutual STOMP subprotocol offered', async () => {
        const ws = new WebSocket(`${wsUrl}/stomp`, ['v10.stomp']);
        const opened = new Promise<void>((resolve, reject) => {
            ws.on('open', () => resolve());
            ws.on('error', reject);
        });
        await opened;
        expect(ws.protocol).toBe('v10.stomp');
        ws.close(1000, 'done');
    });

    test('a non-STOMP socket path keeps the stock first-offered echo', async () => {
        const ws = new WebSocket(`${wsUrl}/plain`, ['chat', 'other']);
        const opened = new Promise<void>((resolve, reject) => {
            ws.on('open', () => resolve());
            ws.on('error', reject);
        });
        await opened;
        expect(ws.protocol).toBe('chat');
        ws.close(1000, 'done');
    });

    test('CONNECT handshake answers CONNECTED with version + session', async () => {
        const ws = new WebSocket(`${wsUrl}/stomp`);
        await new Promise<void>((resolve, reject) => {
            ws.on('open', resolve);
            ws.on('error', reject);
        });
        ws.send(frame('CONNECT', { 'accept-version': '1.2,1.1', host: 'example.test' }));
        const connected = await waitFrame(ws);
        expect(connected.command).toBe('CONNECTED');
        expect(connected.headers['version']).toBe('1.2');
        expect(connected.headers['session']).toBeTruthy();
        expect(connected.headers['heart-beat']).toBe('0,0');
        ws.close(1000, 'done');
    });

    test('SUBSCRIBE + SEND fans out MESSAGE frames to subscribers', async () => {
        const a = new WebSocket(`${wsUrl}/stomp`);
        const b = new WebSocket(`${wsUrl}/stomp`);
        await Promise.all([
            new Promise<void>((resolve, reject) => {
                a.on('open', resolve);
                a.on('error', reject);
            }),
            new Promise<void>((resolve, reject) => {
                b.on('open', resolve);
                b.on('error', reject);
            }),
        ]);
        a.send(frame('CONNECT', { 'accept-version': '1.2', host: 'x' }));
        b.send(frame('CONNECT', { 'accept-version': '1.2', host: 'x' }));
        await waitFrame(a);
        await waitFrame(b);
        a.send(frame('SUBSCRIBE', { destination: '/topic/chat', id: 'a-sub', receipt: 'r-a' }));
        b.send(frame('SUBSCRIBE', { destination: '/topic/chat', id: 'b-sub', receipt: 'r-b' }));
        await waitFrame(a); // RECEIPT r-a: subscription registered
        await waitFrame(b); // RECEIPT r-b

        a.send(frame('SEND', { destination: '/topic/chat' }, 'hello stomp'));

        const toA = await waitFrame(a);
        const toB = await waitFrame(b);
        expect(toA.command).toBe('MESSAGE');
        expect(toB.command).toBe('MESSAGE');
        expect(toA.headers['subscription']).toBe('a-sub');
        expect(toB.headers['subscription']).toBe('b-sub');
        expect(toA.headers['destination']).toBe('/topic/chat');
        expect(toA.body).toBe('hello stomp');
        expect(toB.body).toBe('hello stomp');
        a.close(1000, 'done');
        b.close(1000, 'done');
    });

    test('publish from outside the handler reaches subscribers (AD-23 D5)', async () => {
        const ws = new WebSocket(`${wsUrl}/stomp`);
        await new Promise<void>((resolve, reject) => {
            ws.on('open', resolve);
            ws.on('error', reject);
        });
        ws.send(frame('CONNECT', { 'accept-version': '1.2', host: 'x' }));
        await waitFrame(ws);
        ws.send(frame('SUBSCRIBE', { destination: '/topic/push', id: 's', receipt: 'r-s' }));
        const receipt = await waitFrame(ws);
        expect(receipt.command).toBe('RECEIPT');

        controller.broker.publish('/topic/push', 'server push');

        const message = await waitFrame(ws);
        expect(message.command).toBe('MESSAGE');
        expect(message.body).toBe('server push');
        ws.close(1000, 'done');
    });

    test('a receipt is emitted for frames that ask for one', async () => {
        const ws = new WebSocket(`${wsUrl}/stomp`);
        await new Promise<void>((resolve, reject) => {
            ws.on('open', resolve);
            ws.on('error', reject);
        });
        ws.send(frame('CONNECT', { 'accept-version': '1.2', host: 'x' }));
        await waitFrame(ws);
        ws.send(frame('SUBSCRIBE', { destination: '/topic/r', id: 's', receipt: 'r-1' }));
        const receipt = await waitFrame(ws);
        expect(receipt.command).toBe('RECEIPT');
        expect(receipt.headers['receipt-id']).toBe('r-1');
        ws.close(1000, 'done');
    });

    test('a protocol violation returns ERROR + close 1002', async () => {
        const ws = new WebSocket(`${wsUrl}/stomp`);
        await new Promise<void>((resolve, reject) => {
            ws.on('open', resolve);
            ws.on('error', reject);
        });
        ws.send(frame('CONNECT', { 'accept-version': '1.2', host: 'x' }));
        await waitFrame(ws);
        // SEND without a destination — fail-closed (AD-23 D2).
        ws.send(frame('SEND', {}));
        const error = await waitFrame(ws);
        expect(error.command).toBe('ERROR');
        expect(error.headers['message']).toContain('destination');
        const closedCode = await new Promise<number>((resolve) => {
            ws.once('close', (code: number) => resolve(code));
        });
        expect(closedCode).toBe(1002);
    });

    test('binary frames round-trip byte-exact (AD-23 D8)', async () => {
        const ws = new WebSocket(`${wsUrl}/stomp`);
        await new Promise<void>((resolve, reject) => {
            ws.on('open', resolve);
            ws.on('error', reject);
        });
        ws.send(frame('CONNECT', { 'accept-version': '1.2', host: 'x' }));
        await waitFrame(ws);
        ws.send(frame('SUBSCRIBE', { destination: '/topic/bin', id: 'bin', receipt: 'r-bin' }));
        await waitFrame(ws);
        // A genuine binary WS frame: raw STOMP bytes (headers + NUL body).
        const payloadBytes = new Uint8Array([0, 3, 255, 0, 1]);
        const headerBytes = new TextEncoder().encode('SEND\ndestination:/topic/bin\ncontent-length:5\n\n');
        const wire = new Uint8Array(headerBytes.length + payloadBytes.length + 1);
        wire.set(headerBytes, 0);
        wire.set(payloadBytes, headerBytes.length);
        wire[wire.length - 1] = 0x00;
        ws.send(wire);
        const message = await waitFrame(ws);
        expect(message.command).toBe('MESSAGE');
        expect(message.body).toEqual(payloadBytes);
        ws.close(1000, 'done');
    });

    test('queue backlog replays to a late subscriber (AD-23 D11)', async () => {
        controller.broker.publish('/queue/jobs', 'job-1');
        const ws = new WebSocket(`${wsUrl}/stomp`);
        await new Promise<void>((resolve, reject) => {
            ws.on('open', resolve);
            ws.on('error', reject);
        });
        ws.send(frame('CONNECT', { 'accept-version': '1.2', host: 'x' }));
        await waitFrame(ws);
        // Collect both expected frames up front: the replay MESSAGE and the
        // SUBSCRIBE's RECEIPT are emitted back-to-back, so registering the
        // second waiter after the first resolves would miss it.
        const collected: StompFrame[] = [];
        ws.on('message', (data: unknown, isBinary: boolean) => {
            collected.push(isBinary ? parseStompFrame(data as Uint8Array) : parseStompFrame(String(data)));
        });
        ws.send(frame('SUBSCRIBE', { destination: '/queue/jobs', id: 'jobs', receipt: 'r-q' }));
        // Replay is delivery: MESSAGE frames arrive before the RECEIPT
        // that acknowledges the SUBSCRIBE.
        await waitFor(() => collected.length >= 2);
        expect(collected[0]?.command).toBe('MESSAGE');
        expect(collected[0]?.body).toBe('job-1');
        const receipt = collected[1];
        expect(receipt?.command).toBe('RECEIPT');
        expect(receipt?.headers['receipt-id']).toBe('r-q');
        ws.close(1000, 'done');
    });

    test('/user destinations route by resolved user (AD-23 D10)', async () => {
        // Second controller scoped to fixed users (attributes preset via
        // the adapter's authenticate seam is not wired here — resolveUser
        // reads attributes.user, so preset directly).
        const ws = new WebSocket(`${wsUrl}/stomp`);
        await new Promise<void>((resolve, reject) => {
            ws.on('open', resolve);
            ws.on('error', reject);
        });
        ws.send(frame('CONNECT', { 'accept-version': '1.2', host: 'x' }));
        await waitFrame(ws);
        // No authenticate hook in this harness — the subscription must fail
        // without a resolved user (policy violation, 1008).
        ws.send(frame('SUBSCRIBE', { destination: '/user/queue/events', id: 'u1' }));
        const error = await waitFrame(ws);
        expect(error.command).toBe('ERROR');
        const closedCode = await new Promise<number>((resolve) => {
            ws.once('close', (code: number) => resolve(code));
        });
        expect(closedCode).toBe(1008);
    });
});
