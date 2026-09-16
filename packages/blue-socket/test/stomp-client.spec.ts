/**
 * `StompClient` unit tests (AD-23 Phase 3) — `SocketClient` doubles with a
 * status signal + AsyncReader message stream. Covers the CONNECT handshake
 * (default and custom headers), subscription routing, send/receipt
 * correlation, ERROR surfacing, ack modes, deliberate teardown, and the
 * re-CONNECT + re-SUBSCRIBE lifecycle across socket reconnects.
 * @module blue-socket
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test, vi } from 'vitest';
import { signal, type Signal } from '@blue/signals';
import {
    AsyncReader,
    StompClient,
    StompProtocolError,
    parseStompFrame,
    serializeStompFrame,
    type SocketClient,
    type SocketStatus,
} from '../src/index';

/**
 * Controlled `SocketClient` double: tests drive the status signal and push
 * inbound frames; sent frames and close calls are recorded.
 */
class FakeSocket implements SocketClient {
    readonly url = 'ws://realtime.example.test:3000/stomp/chat';
    readonly status: Signal<SocketStatus> = signal<SocketStatus>('connecting');
    readonly #inbound = new AsyncReader<unknown>();
    readonly sent: Array<string | Uint8Array> = [];
    closed: { code: number; reason: string } | null = null;

    get messages(): AsyncIterable<unknown> {
        return this.#inbound.iterable();
    }

    /** Transition the transport to open (what a real socket does on onopen). */
    open(): void {
        this.status.value = 'open';
    }

    /** Simulate an unexpected drop (transport-level). */
    drop(): void {
        this.status.value = 'reconnecting';
    }

    /** Simulate the transport's terminal close. */
    transportClose(): void {
        this.status.value = 'closed';
        this.#inbound.complete();
    }

    /** Push a raw server frame. */
    pushFrame(raw: string): void {
        this.#inbound.push(raw);
    }

    /** Push a server frame with headers/body split, serialized minimally. */
    push(command: string, headers: Record<string, string> = {}, body = ''): void {
        this.pushFrame(
            `${command}\n${Object.entries(headers)
                .map(([k, v]) => `${k}:${v}`)
                .join('\n')}\n\n${body}\0`
        );
    }

    /** The server side of the handshake. */
    connected(): void {
        this.push('CONNECTED', { version: '1.2', session: 's-1', 'heart-beat': '0,0' });
    }

    /** RECEIPT the most recent SEND frame (matching its receipt id). */
    replyLastSend(): void {
        const send = [...this.frames].reverse().find((frame) => frame.command === 'SEND');
        const receiptId = send?.headers['receipt'];
        if (receiptId === undefined) {
            throw new Error('no SEND frame with a receipt header to reply to');
        }
        this.push('RECEIPT', { 'receipt-id': receiptId });
    }

    send(data: unknown): void {
        this.sent.push(typeof data === 'string' ? data : data instanceof Uint8Array ? data : String(data));
    }

    close(code: number = 1000, reason: string = ''): void {
        this.closed = { code, reason };
        this.status.value = 'closed';
        this.#inbound.complete();
    }

    /** Parsed outbound frames. */
    get frames(): Array<{ command: string; headers: Record<string, string>; body: string | Uint8Array }> {
        return this.sent.map((raw) => parseStompFrame(raw));
    }
}

/** Wire a client to a fresh fake and bring it through the handshake. */
function openClient(options: ConstructorParameters<typeof StompClient>[1] = {}): {
    socket: FakeSocket;
    client: StompClient;
} {
    const socket = new FakeSocket();
    const client = new StompClient(socket, options);
    socket.open();
    socket.connected();
    return { socket, client };
}

describe('StompClient CONNECT', () => {
    test('sends CONNECT with default accept-version and host derived from the URL', async () => {
        const socket = new FakeSocket();
        const client = new StompClient(socket);
        socket.open();
        await vi.waitFor(() => expect(socket.frames.length).toBe(1));
        const [connect] = socket.frames;
        expect(connect.command).toBe('CONNECT');
        expect(connect.headers['accept-version']).toBe('1.2,1.1,1.0');
        expect(connect.headers['host']).toBe('realtime.example.test:3000');
        expect(connect.headers['heart-beat']).toBe('0,0');
        client.disconnect();
    });

    test('honors custom acceptVersion, host, login, passcode, heartBeat', async () => {
        const socket = new FakeSocket();
        const client = new StompClient(socket, {
            acceptVersion: '1.2',
            host: 'stomp.example.test',
            login: 'alice',
            passcode: 'secret',
            heartBeat: '10000,10000',
        });
        socket.open();
        await vi.waitFor(() => expect(socket.frames.length).toBe(1));
        const [connect] = socket.frames;
        expect(connect.headers['accept-version']).toBe('1.2');
        expect(connect.headers['host']).toBe('stomp.example.test');
        expect(connect.headers['login']).toBe('alice');
        expect(connect.headers['passcode']).toBe('secret');
        expect(connect.headers['heart-beat']).toBe('10000,10000');
        client.disconnect();
    });

    test('flips connected on CONNECTED', async () => {
        const { client } = openClient();
        await vi.waitFor(() => expect(client.connected.value).toBe(true));
        client.disconnect();
    });
});

describe('StompClient subscriptions', () => {
    test('subscribe while connected sends SUBSCRIBE with id + ack', async () => {
        const { socket, client } = openClient();
        await vi.waitFor(() => expect(client.connected.value).toBe(true));
        const sub = client.subscribe('/topic/chat', { id: 'my-sub', ack: 'client' });
        await vi.waitFor(() => expect(socket.frames.length).toBe(2));
        const [connect, subscribe] = socket.frames;
        expect(connect.command).toBe('CONNECT');
        expect(subscribe.command).toBe('SUBSCRIBE');
        expect(subscribe.headers).toMatchObject({ destination: '/topic/chat', id: 'my-sub', ack: 'client' });
        client.disconnect();
    });

    test('MESSAGE frames route to the subscription stream with json()', async () => {
        const { socket, client } = openClient();
        const sub = client.subscribe('/topic/chat', { id: 's1' });
        const received: Array<unknown> = [];
        void (async () => {
            for await (const message of sub.messages) {
                received.push(message);
            }
        })();
        await vi.waitFor(() => expect(client.connected.value).toBe(true));
        socket.push('MESSAGE', { destination: '/topic/chat', subscription: 's1', 'message-id': 'm-1' }, '{"x":1}');
        await vi.waitFor(() => expect(received.length).toBe(1));
        const message = received[0] as { body: string; json(): unknown; headers: Record<string, string> };
        expect(message.body).toBe('{"x":1}');
        expect(message.json()).toEqual({ x: 1 });
        client.disconnect();
    });

    test('two subscriptions receive only their own frames', async () => {
        const { socket, client } = openClient();
        const a: Array<string> = [];
        const b: Array<string> = [];
        void (async () => {
            for await (const message of client.subscribe('/t/a', { id: 'a' }).messages) {
                a.push(message.body);
            }
        })();
        void (async () => {
            for await (const message of client.subscribe('/t/b', { id: 'b' }).messages) {
                b.push(message.body);
            }
        })();
        // The handshake microtask (CONNECT → CONNECTED → SUBSCRIBE) is
        // async: wait until both SUBSCRIBE frames hit the wire, which
        // proves the entries are `live` and MESSAGE routing is active.
        await vi.waitFor(() => expect(socket.frames.filter((frame) => frame.command === 'SUBSCRIBE').length).toBe(2));
        socket.push('MESSAGE', { destination: '/t/a', subscription: 'a', 'message-id': 'm1' }, 'to-a');
        socket.push('MESSAGE', { destination: '/t/b', subscription: 'b', 'message-id': 'm2' }, 'to-b');
        socket.push('MESSAGE', { destination: '/t/a', subscription: 'a', 'message-id': 'm3' }, 'again-a');
        await vi.waitFor(() => expect(a.length).toBe(2));
        await vi.waitFor(() => expect(b.length).toBe(1));
        expect(a).toEqual(['to-a', 'again-a']);
        expect(b).toEqual(['to-b']);
        client.disconnect();
    });

    test('unsubscribe sends UNSUBSCRIBE and completes the stream', async () => {
        const { socket, client } = openClient();
        const sub = client.subscribe('/topic/chat', { id: 's1' });
        const done: Array<void> = [];
        void (async () => {
            for await (const _message of sub.messages) {
                // drain
            }
            done.push(undefined);
        })();
        await vi.waitFor(() => expect(client.connected.value).toBe(true));
        sub.unsubscribe();
        await vi.waitFor(() => expect(done.length).toBe(1));
        expect(socket.frames.at(-1)?.command).toBe('UNSUBSCRIBE');
        expect(socket.frames.at(-1)?.headers['id']).toBe('s1');
        client.disconnect();
    });

    test('ack/nack send ACK/NACK frames with id + subscription', async () => {
        const { socket, client } = openClient();
        const sub = client.subscribe('/topic/chat', { id: 's1', ack: 'client' });
        await vi.waitFor(() => expect(client.connected.value).toBe(true));
        sub.ack('m-7');
        sub.nack('m-8');
        const commands = socket.frames.slice(2).map((frame) => frame.command);
        expect(commands).toEqual(['ACK', 'NACK']);
        expect(socket.frames[2]?.headers).toMatchObject({ id: 'm-7', subscription: 's1' });
        expect(socket.frames[3]?.headers).toMatchObject({ id: 'm-8', subscription: 's1' });
        client.disconnect();
    });
});

describe('StompClient sends and receipts', () => {
    test('send resolves when the matching RECEIPT arrives', async () => {
        const { socket, client } = openClient();
        let resolved = false;
        void client.send('/topic/chat', 'hello').then(() => {
            resolved = true;
        });
        // The SEND frame carries an auto-generated receipt header.
        await vi.waitFor(() => expect(socket.frames.some((frame) => frame.command === 'SEND')).toBe(true));
        const send = socket.frames.find((frame) => frame.command === 'SEND');
        expect(send?.headers['destination']).toBe('/topic/chat');
        expect(send?.headers['receipt']).toMatch(/^receipt-/);
        expect(send?.body).toBe('hello');
        socket.replyLastSend();
        await vi.waitFor(() => expect(resolved).toBe(true));
        client.disconnect();
    });

    test('honors a caller-supplied receipt header', async () => {
        const { socket, client } = openClient();
        let resolved = false;
        void client.send('/topic/chat', 'x', { receipt: 'my-receipt' }).then(() => {
            resolved = true;
        });
        await vi.waitFor(() => expect(socket.frames.some((frame) => frame.command === 'SEND')).toBe(true));
        expect(socket.frames.find((frame) => frame.command === 'SEND')?.headers['receipt']).toBe('my-receipt');
        socket.push('RECEIPT', { 'receipt-id': 'my-receipt' });
        await vi.waitFor(() => expect(resolved).toBe(true));
        client.disconnect();
    });

    test('JSON-encodes non-string bodies', async () => {
        const { socket, client } = openClient();
        const sent = client.send('/topic/chat', { event: 'chat', data: 1 });
        await vi.waitFor(() => expect(socket.frames.some((frame) => frame.command === 'SEND')).toBe(true));
        expect(socket.frames.find((frame) => frame.command === 'SEND')?.body).toBe('{"event":"chat","data":1}');
        socket.replyLastSend();
        await sent; // settle the receipt so disconnect is clean
        client.disconnect();
    });

    test('pending sends flush after a reconnect handshake', async () => {
        const socket = new FakeSocket();
        const client = new StompClient(socket);
        socket.open();
        socket.connected();
        await vi.waitFor(() => expect(client.connected.value).toBe(true));
        // Drop: STOMP session resets, connected clears.
        socket.drop();
        await vi.waitFor(() => expect(client.connected.value).toBe(false));
        let resolved = false;
        void client.send('/topic/chat', 'during-gap').then(() => {
            resolved = true;
        });
        // Reconnect: new open → CONNECT → CONNECTED → flush.
        socket.open();
        socket.connected();
        await vi.waitFor(() => expect(socket.frames.some((frame) => frame.command === 'SEND')).toBe(true));
        socket.replyLastSend();
        await vi.waitFor(() => expect(resolved).toBe(true));
        client.disconnect();
    });

    test('sends Uint8Array bodies as binary SEND frames (AD-23 D8)', async () => {
        const { socket, client } = openClient();
        const body = new Uint8Array([0, 1, 255, 0]);
        const sent = client.send('/topic/bin', body, { 'content-type': 'application/octet-stream' });
        await vi.waitFor(() => expect(socket.frames.some((frame) => frame.command === 'SEND')).toBe(true));
        const send = socket.frames.find((frame) => frame.command === 'SEND');
        expect(send?.body).toEqual(body);
        expect(send?.headers['content-type']).toBe('application/octet-stream');
        expect(send?.headers['content-length']).toBe('4');
        socket.replyLastSend();
        await sent; // settle the receipt so disconnect is clean
        client.disconnect();
    });

    test('delivers binary MESSAGE frames body byte-exact (AD-23 D8)', async () => {
        const { socket, client } = openClient();
        const sub = client.subscribe('/topic/bin', { id: 'bin-sub' });
        const received: Array<unknown> = [];
        void (async () => {
            for await (const message of sub.messages) {
                received.push(message);
            }
        })();
        await vi.waitFor(() => expect(client.connected.value).toBe(true));
        const body = new Uint8Array([9, 0, 7, 0, 255]);
        socket.pushFrame(
            serializeStompFrame({
                command: 'MESSAGE',
                headers: { destination: '/topic/bin', subscription: 'bin-sub', 'message-id': 'm-1' },
                body,
            })
        );
        await vi.waitFor(() => expect(received.length).toBe(1));
        const message = received[0] as { body: string | Uint8Array };
        expect(message.body).toEqual(body);
        client.disconnect();
    });
});

describe('StompClient errors and teardown', () => {
    test('a server ERROR invokes onError and rejects pending sends', async () => {
        const socket = new FakeSocket();
        const onError = vi.fn();
        const client = new StompClient(socket, { onError });
        socket.open();
        socket.connected();
        await vi.waitFor(() => expect(client.connected.value).toBe(true));
        let rejection: Error | null = null;
        void client.send('/topic/chat', 'x').catch((error: Error) => {
            rejection = error;
        });
        socket.push('ERROR', { message: 'destination unknown' });
        await vi.waitFor(() => expect(rejection).not.toBeNull());
        expect(rejection).toBeInstanceOf(StompProtocolError);
        expect((rejection as unknown as Error).message).toBe('destination unknown');
        expect(onError).toHaveBeenCalledWith('destination unknown');
        await vi.waitFor(() => expect(client.connected.value).toBe(false));
        client.disconnect();
    });

    test('reconnect: false ends the session at the first drop', async () => {
        const socket = new FakeSocket();
        const client = new StompClient(socket, { reconnect: false });
        socket.open();
        socket.connected();
        await vi.waitFor(() => expect(client.connected.value).toBe(true));
        let rejected: Error | null = null;
        void client.send('/topic/chat', 'x').catch((error: Error) => {
            rejected = error;
        });
        const ended: Array<void> = [];
        void (async () => {
            for await (const _ of client.closed) {
                // drain
            }
            ended.push(undefined);
        })();
        socket.drop();
        await vi.waitFor(() => expect(client.connected.value).toBe(false));
        await vi.waitFor(() => expect(ended.length).toBe(1));
        expect(rejected).toBeInstanceOf(StompProtocolError);
        client.disconnect();
    });

    test('disconnect sends DISCONNECT, closes the socket, completes streams', async () => {
        const { socket, client } = openClient();
        const sub = client.subscribe('/topic/chat', { id: 's1' });
        const ended: Array<void> = [];
        void (async () => {
            for await (const _message of sub.messages) {
                // drain
            }
            ended.push(undefined);
        })();
        await vi.waitFor(() => expect(client.connected.value).toBe(true));
        client.disconnect();
        await vi.waitFor(() => expect(ended.length).toBe(1));
        expect(socket.frames.at(-1)?.command).toBe('DISCONNECT');
        expect(socket.closed).toEqual({ code: 1000, reason: 'stomp disconnect' });
        expect(client.connected.value).toBe(false);
    });

    test('subscribe before the first open is buffered and sent after CONNECTED', async () => {
        const socket = new FakeSocket();
        const client = new StompClient(socket);
        const sub = client.subscribe('/topic/chat', { id: 'early' });
        await vi.waitFor(() => expect(socket.frames.length).toBe(0)); // nothing sent pre-open
        socket.open();
        socket.connected();
        await vi.waitFor(() => expect(client.connected.value).toBe(true));
        await vi.waitFor(() => expect(socket.frames.some((frame) => frame.command === 'SUBSCRIBE')).toBe(true));
        expect(socket.frames.find((frame) => frame.command === 'SUBSCRIBE')?.headers['id']).toBe('early');
        client.disconnect();
    });

    test('a buffered subscription replays its requested ack mode', async () => {
        const socket = new FakeSocket();
        const client = new StompClient(socket);
        client.subscribe('/topic/chat', { id: 'early', ack: 'client-individual' });
        socket.open();
        socket.connected();
        await vi.waitFor(() => expect(socket.frames.some((frame) => frame.command === 'SUBSCRIBE')).toBe(true));
        expect(socket.frames.find((frame) => frame.command === 'SUBSCRIBE')?.headers['ack']).toBe('client-individual');
        client.disconnect();
    });
});
