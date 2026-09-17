/**
 * `StompClient` unit tests (AD-23 Phase 3) — `SocketClient` doubles with a
 * status signal + AsyncReader message stream, plus one end-to-end case over
 * the real `WebSocketClient`. Covers the CONNECT handshake (resolver-driven
 * timeout, RT-1), subscription routing, send/receipt correlation and its
 * drop semantics (COR-12), ERROR surfacing, ack modes, deliberate teardown,
 * and the re-CONNECT + re-SUBSCRIBE lifecycle across socket reconnects.
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
    WebSocketClient,
    parseStompFrame,
    serializeStompFrame,
    type SocketClient,
    type SocketStatus,
    type SocketTransport,
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

/**
 * Flush queued microtasks (frame delivery, effect passes, handshake
 * resumption) — the fake-timer-safe alternative to `vi.waitFor`.
 */
async function flushMicrotasks(turns = 32): Promise<void> {
    let turn: Promise<void> = Promise.resolve();
    for (let index = 0; index < turns; index++) {
        turn = turn.then(() => undefined);
    }
    await turn;
}

/**
 * Controlled WHATWG-subset transport for the end-to-end case: drives the
 * real `WebSocketClient`, so the drop path under test is the production
 * one (unexpected close → `reconnecting`).
 */
class FakeTransport implements SocketTransport {
    binaryType: 'blob' | 'arraybuffer' | undefined;
    onopen: ((event: unknown) => void) | null = null;
    onmessage: ((event: { data: unknown }) => void) | null = null;
    onclose: ((event: { code: number; reason: string; wasClean: boolean }) => void) | null = null;
    onerror: ((event: unknown) => void) | null = null;
    readonly sent: string[] = [];

    send(data: string): void {
        this.sent.push(data);
    }

    close(): void {
        this.onclose?.({ code: 1000, reason: '', wasClean: true });
    }

    fireOpen(): void {
        this.onopen?.(undefined);
    }

    fireMessage(data: unknown): void {
        this.onmessage?.({ data });
    }

    /** Unexpected peer drop (abnormal close, not a handshake). */
    fireClose(code = 1006): void {
        this.onclose?.({ code, reason: '', wasClean: false });
    }
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
        // Auto receipt ids live in the client namespace so a caller-supplied
        // `receipt` header can never collide with a generated one.
        expect(send?.headers['receipt']).toMatch(/^bluejs-/);
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

    test('a send buffered for the new session survives a further drop (COR-12)', async () => {
        const socket = new FakeSocket();
        const client = new StompClient(socket);
        socket.open();
        socket.connected();
        await vi.waitFor(() => expect(client.connected.value).toBe(true));
        socket.drop();
        await vi.waitFor(() => expect(client.connected.value).toBe(false));
        let state = 'pending';
        const sending = client.send('/topic/chat', 'during-gap').then(
            () => {
                state = 'resolved';
            },
            (error: Error) => {
                state = error.message;
            }
        );
        // The transport opens (CONNECT #2, handshake armed), then drops again
        // before CONNECTED. The frame never left the wire, so its receipt is
        // not one of the drop's casualties — the promise stays pending for
        // the next session.
        socket.open();
        await vi.waitFor(() => expect(socket.frames.filter((frame) => frame.command === 'CONNECT').length).toBe(2));
        socket.drop();
        await Promise.resolve();
        expect(state).toBe('pending');
        socket.open();
        socket.connected();
        await vi.waitFor(() => expect(socket.frames.some((frame) => frame.command === 'SEND')).toBe(true));
        socket.replyLastSend();
        await sending;
        expect(state).toBe('resolved');
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

    test('a transport drop rejects a send whose frame left the wire (COR-12)', async () => {
        const { socket, client } = openClient();
        await vi.waitFor(() => expect(client.connected.value).toBe(true));
        let rejection: Error | null = null;
        const sending = client.send('/topic/chat', 'x').catch((error: Error) => {
            rejection = error;
        });
        // Only a frame that reached the transport is at risk: wait for the
        // SEND before dropping.
        await vi.waitFor(() => expect(socket.frames.some((frame) => frame.command === 'SEND')).toBe(true));
        socket.drop();
        // Regression: with `reconnect: true` (the default) the new STOMP
        // session can never receipt the old id — the promise used to hang.
        await sending;
        expect(rejection).toBeInstanceOf(StompProtocolError);
        expect((rejection as unknown as Error).message).toBe('connection closed');
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

describe('StompClient lifecycle hardening', () => {
    test('send after the session ended rejects immediately', async () => {
        const { client } = openClient();
        client.disconnect();
        await expect(client.send('/topic/x', 'late')).rejects.toMatchObject({ name: 'StompProtocolError' });
    });

    test('a server ERROR ends the session: streams complete, later sends reject', async () => {
        const { socket, client } = openClient();
        let closed = false;
        void (async () => {
            for await (const _ of client.closed) {
                // no-op
            }
            closed = true;
        })();
        let subEnded = false;
        const sub = client.subscribe('/topic/x');
        void (async () => {
            for await (const _ of sub.messages) {
                // no-op
            }
            subEnded = true;
        })();
        await vi.waitFor(() => expect(socket.frames.some((frame) => frame.command === 'SUBSCRIBE')).toBe(true));
        socket.push('ERROR', { message: 'boom' });
        await vi.waitFor(() => expect(closed).toBe(true));
        await vi.waitFor(() => expect(subEnded).toBe(true));
        // The session is terminal — no zombie buffering or re-CONNECT.
        await expect(client.send('/topic/x', 'after')).rejects.toMatchObject({ name: 'StompProtocolError' });
        await vi.waitFor(() => expect(socket.frames.filter((frame) => frame.command === 'SEND').length).toBe(0));
    });

    test('a CONNECT timeout ends the session with onError and rejects later sends', async () => {
        const socket = new FakeSocket();
        const onError = vi.fn();
        const client = new StompClient(socket, { connectTimeoutMs: 30, onError });
        let closed = false;
        void (async () => {
            for await (const _ of client.closed) {
                // no-op
            }
            closed = true;
        })();
        // Transport opens but the server never answers CONNECTED.
        socket.open();
        await vi.waitFor(() => expect(closed).toBe(true), { timeout: 2000 });
        expect(onError).toHaveBeenCalledWith('CONNECT timed out');
        expect(client.connected.value).toBe(false);
        await expect(client.send('/topic/x', 'late')).rejects.toMatchObject({ name: 'StompProtocolError' });
    });

    test('the handshake arms one timer, times out, and leaves nothing scheduled (RT-1)', async () => {
        vi.useFakeTimers();
        // Observe what the handshake schedules: a resolver waits on one
        // timeout; the replaced poll armed a 10 ms wakeup per tick.
        const scheduled: number[] = [];
        const fakeSetTimeout = globalThis.setTimeout;
        vi.stubGlobal('setTimeout', ((handler: () => void, timeout?: number, ...args: unknown[]) => {
            scheduled.push(Number(timeout));
            return fakeSetTimeout(handler, timeout, ...args);
        }) as typeof setTimeout);
        try {
            const socket = new FakeSocket();
            const onError = vi.fn();
            const client = new StompClient(socket, { connectTimeoutMs: 5000, onError });
            socket.open();
            await flushMicrotasks(); // effect → microtask → CONNECT + timer
            expect(socket.frames.filter((frame) => frame.command === 'CONNECT').length).toBe(1);
            expect(scheduled).toEqual([5000]);
            // A stalled server: the deadline elapses and the session fails.
            await vi.advanceTimersByTimeAsync(5000);
            await flushMicrotasks();
            expect(onError).toHaveBeenCalledWith('CONNECT timed out');
            expect(client.connected.value).toBe(false);
            expect(vi.getTimerCount()).toBe(0); // cleared on settle
            client.disconnect();
        } finally {
            vi.unstubAllGlobals();
            vi.useRealTimers();
        }
    });

    test('a completed handshake clears its timeout and never fails the live session (RT-1)', async () => {
        vi.useFakeTimers();
        try {
            const socket = new FakeSocket();
            const onError = vi.fn();
            const client = new StompClient(socket, { connectTimeoutMs: 5000, onError });
            const sub = client.subscribe('/topic/chat', { id: 's1' });
            const received: Array<string> = [];
            void (async () => {
                for await (const message of sub.messages) {
                    received.push(message.body);
                }
            })();
            socket.open();
            socket.connected();
            await flushMicrotasks(); // handshake settles, SUBSCRIBE flushes
            expect(client.connected.value).toBe(true);
            expect(socket.frames.some((frame) => frame.command === 'SUBSCRIBE')).toBe(true);
            expect(vi.getTimerCount()).toBe(0);
            // The deadline passing later must not touch the live session.
            await vi.advanceTimersByTimeAsync(10_000);
            await flushMicrotasks();
            expect(onError).not.toHaveBeenCalled();
            expect(client.connected.value).toBe(true);
            socket.push('MESSAGE', { destination: '/topic/chat', subscription: 's1', 'message-id': 'm-1' }, 'hi');
            await flushMicrotasks();
            expect(received).toEqual(['hi']);
            client.disconnect();
        } finally {
            vi.useRealTimers();
        }
    });

    test('a drop re-CONNECTs and re-SUBSCRIBEs the active subscriptions (RT-1)', async () => {
        const socket = new FakeSocket();
        const client = new StompClient(socket);
        const sub = client.subscribe('/topic/chat', { id: 's1', ack: 'client-individual' });
        const received: Array<string> = [];
        void (async () => {
            for await (const message of sub.messages) {
                received.push(message.body);
            }
        })();
        socket.open();
        socket.connected();
        await vi.waitFor(() => expect(socket.frames.filter((frame) => frame.command === 'SUBSCRIBE').length).toBe(1));
        socket.drop();
        await vi.waitFor(() => expect(client.connected.value).toBe(false));
        socket.open();
        socket.connected();
        await vi.waitFor(() => expect(socket.frames.filter((frame) => frame.command === 'SUBSCRIBE').length).toBe(2));
        // Same id, same ack mode — the server rebinds the same subscription.
        expect(socket.frames.filter((frame) => frame.command === 'SUBSCRIBE')[1]?.headers).toMatchObject({
            destination: '/topic/chat',
            id: 's1',
            ack: 'client-individual',
        });
        expect(socket.frames.filter((frame) => frame.command === 'CONNECT').length).toBe(2);
        // Delivery resumes on the same iterable.
        socket.push('MESSAGE', { destination: '/topic/chat', subscription: 's1', 'message-id': 'm-2' }, 'resumed');
        await vi.waitFor(() => expect(received).toEqual(['resumed']));
        client.disconnect();
    });

    test('a superseded handshake never fails the newer session (RT-1)', async () => {
        const socket = new FakeSocket();
        const onError = vi.fn();
        const client = new StompClient(socket, { connectTimeoutMs: 40, onError });
        socket.open();
        await flushMicrotasks(); // CONNECT #1 sent, its handshake armed
        expect(socket.frames.filter((frame) => frame.command === 'CONNECT').length).toBe(1);
        // Drop mid-handshake (CONNECT #1 unanswered), then reconnect for real.
        socket.drop();
        socket.open();
        socket.connected();
        await flushMicrotasks();
        expect(client.connected.value).toBe(true);
        // Let the superseded handshake's deadline pass: it must not fail the
        // session it no longer belongs to.
        const { promise: elapsed, resolve: elapsedResolve } = Promise.withResolvers<void>();
        setTimeout(elapsedResolve, 60);
        await elapsed;
        expect(onError).not.toHaveBeenCalled();
        expect(client.connected.value).toBe(true);
        client.disconnect();
    });

    test('a handshake superseded inside the same epoch never fails the session (RT-1)', async () => {
        const socket = new FakeSocket();
        const onError = vi.fn();
        const client = new StompClient(socket, { connectTimeoutMs: 40, onError });
        // All three transitions land before the queued handshake pass runs:
        // two passes queue inside the same epoch, each arming a handshake.
        socket.open();
        socket.drop();
        socket.open();
        socket.connected();
        await flushMicrotasks();
        expect(client.connected.value).toBe(true);
        // Past the first handshake's deadline: it must not fail the live one.
        const { promise: elapsed, resolve: elapsedResolve } = Promise.withResolvers<void>();
        setTimeout(elapsedResolve, 60);
        await elapsed;
        expect(onError).not.toHaveBeenCalled();
        expect(client.connected.value).toBe(true);
        // The surviving session still works end to end.
        const sending = client.send('/topic/chat', 'after-supersede');
        await vi.waitFor(() => expect(socket.frames.some((frame) => frame.command === 'SEND')).toBe(true));
        socket.replyLastSend();
        await sending;
        client.disconnect();
    });

    test('pending sends are bounded; the oldest rejects on overflow', async () => {
        const socket = new FakeSocket();
        const client = new StompClient(socket, { maxPendingSends: 2 });
        let first: string | null = null;
        let second: string | null = null;
        const firstSend = client.send('/topic/x', '1').then(
            () => {
                first = 'resolved';
            },
            (error: Error) => {
                first = error.message;
            }
        );
        const secondSend = client.send('/topic/x', '2').then(() => {
            second = 'resolved';
        });
        const thirdSend = client.send('/topic/x', '3'); // evicts the first (stays buffered itself)
        await firstSend;
        expect(first).toContain('send buffer overflow');
        expect(second).toBeNull();
        socket.open();
        socket.connected();
        await vi.waitFor(() => expect(socket.frames.filter((frame) => frame.command === 'SEND').length).toBe(2));
        // Only the two retained sends went out — the evicted one was never
        // flushed, and its receipt promise settled via rejection above.
        expect(socket.frames.filter((frame) => frame.command === 'SEND').map((f) => f.body)).toEqual(['2', '3']);
        // Receipt each retained send by its own id (replyLastSend would
        // answer the same last frame twice).
        const flushed = socket.frames.filter((frame) => frame.command === 'SEND');
        for (const frame of flushed) {
            socket.push('RECEIPT', { 'receipt-id': frame.headers['receipt'] as string });
        }
        await Promise.all([secondSend, thirdSend]);
        expect(second).toBe('resolved');
        client.disconnect();
    });

    test('duplicate subscription id throws instead of orphaning the first stream', async () => {
        const { client } = openClient();
        client.subscribe('/topic/x', { id: 'dup' });
        expect(() => client.subscribe('/topic/y', { id: 'dup' })).toThrow(/duplicate subscription id/);
        client.disconnect();
    });

    test('a caller-supplied receipt header never collides with generated ids', async () => {
        const { socket, client } = openClient();
        let first: string | null = null;
        const firstSend = client.send('/topic/x', 'a', { receipt: 'bluejs-0-fake' }).then(() => {
            first = 'resolved';
        });
        const secondSend = client.send('/topic/y', 'b');
        // The caller-supplied id is used verbatim; the auto id is distinct.
        await vi.waitFor(() => expect(socket.frames.filter((frame) => frame.command === 'SEND').length).toBe(2));
        const sent = socket.frames.filter((frame) => frame.command === 'SEND');
        expect(sent[0]?.headers['receipt']).toBe('bluejs-0-fake');
        expect(sent[1]?.headers['receipt']).not.toBe('bluejs-0-fake');
        socket.replyLastSend(); // receipts the auto-id send
        await secondSend;
        expect(first).toBeNull();
        // The caller-supplied receipt resolves only its own SEND.
        socket.push('RECEIPT', { 'receipt-id': 'bluejs-0-fake' });
        await firstSend;
        expect(first).toBe('resolved');
        client.disconnect();
    });
});

describe('StompClient over the real WebSocketClient', () => {
    test('an unexpected transport drop rejects the in-flight send (COR-12)', async () => {
        const created: Array<FakeTransport> = [];
        const socket = new WebSocketClient('ws://realtime.example.test:3000/stomp/chat', {
            transportFactory: () => {
                const transport = new FakeTransport();
                created.push(transport);
                return transport;
            },
        });
        const client = new StompClient(socket);
        const transport = created[0];
        transport.fireOpen();
        transport.fireMessage(serializeStompFrame({ command: 'CONNECTED', headers: { version: '1.2' }, body: '' }));
        await vi.waitFor(() => expect(client.connected.value).toBe(true));
        let rejection: Error | null = null;
        const sending = client.send('/topic/chat', 'x').catch((error: Error) => {
            rejection = error;
        });
        await vi.waitFor(() =>
            expect(transport.sent.some((raw) => parseStompFrame(raw).command === 'SEND')).toBe(true)
        );
        // The peer drops: the socket publishes `reconnecting`, the frame that
        // left the wire can never be receipted — the app's await settles.
        transport.fireClose(1006);
        await sending;
        expect(rejection).toBeInstanceOf(StompProtocolError);
        expect((rejection as unknown as Error).message).toBe('connection closed');
        client.disconnect();
        expect(socket.status.value).toBe('closed');
    });
});
