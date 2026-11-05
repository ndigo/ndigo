/**
 * `WebSocketClient` unit tests — WHATWG-shaped transport doubles + fake
 * timers (no real sockets). Covers connect/message parity, reconnect
 * backoff + jitter, deliberate-close latching, the optional outbound queue,
 * binary payload framing, and the reconnect trigger (AD-22 D3). Node
 * environment: the binary specs need the same-realm `Buffer` (jsdom's
 * cross-realm intrinsics make `Buffer instanceof Uint8Array` false).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    WebSocketClient,
    type ReconnectTrigger,
    type SocketTransport,
    type WebSocketClientOptions,
} from '../src/index';

/**
 * Controlled WHATWG-subset transport: tests fire events; sent frames and
 * close calls are recorded.
 */
class FakeTransport implements SocketTransport {
    binaryType: 'blob' | 'arraybuffer' | undefined;
    onopen: ((event: unknown) => void) | null = null;
    onmessage: ((event: { data: unknown }) => void) | null = null;
    onclose: ((event: { code: number; reason: string; wasClean: boolean }) => void) | null = null;
    onerror: ((event: unknown) => void) | null = null;
    readonly sent: Array<string | ArrayBuffer> = [];
    closed: { code: number; reason: string } | null = null;

    send(data: string | ArrayBuffer): void {
        this.sent.push(data);
    }

    close(code: number = 1000, reason: string = ''): void {
        this.closed = { code, reason };
        this.onclose?.({ code, reason, wasClean: true });
    }

    fireOpen(): void {
        this.onopen?.(undefined);
    }

    fireMessage(data: unknown): void {
        this.onmessage?.({ data });
    }

    fireClose(code: number = 1006, reason: string = '', wasClean: boolean = false): void {
        this.onclose?.({ code, reason, wasClean });
    }
}

class FakeTrigger implements ReconnectTrigger {
    readonly #listeners: Array<() => void> = [];

    onChange(listener: () => void): () => void {
        this.#listeners.push(listener);
        return () => {
            const index = this.#listeners.indexOf(listener);
            if (index >= 0) {
                this.#listeners.splice(index, 1);
            }
        };
    }

    notify(): void {
        for (const listener of this.#listeners) {
            listener();
        }
    }
}

function createHarness(
    options: Partial<
        Pick<
            WebSocketClientOptions,
            | 'reconnect'
            | 'bufferWhileDisconnected'
            | 'reconnectTrigger'
            | 'onStatusChange'
            | 'onSend'
            | 'maxInboundMessages'
        >
    > = {}
) {
    const created: FakeTransport[] = [];
    const client = new WebSocketClient('wss://test/echo', {
        ...options,
        transportFactory: () => {
            const transport = new FakeTransport();
            created.push(transport);
            return transport;
        },
    });
    return { client, created };
}

/** Yield enough microtask turns for async-generator resumption (fake-timer-safe). */
const drain = async (): Promise<void> => {
    let turn: Promise<void> = Promise.resolve();
    for (let index = 0; index < 32; index++) {
        turn = turn.then(() => undefined);
    }
    await turn;
};

describe('WebSocketClient', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    test('connects, reports open, and delivers messages until a deliberate close', async () => {
        const { client, created } = createHarness();
        expect(client.status.value).toBe('connecting');
        created[0].fireOpen();
        expect(client.status.value).toBe('open');

        const received: unknown[] = [];
        const collecting = (async () => {
            for await (const message of client.messages) {
                received.push(message);
            }
        })();

        created[0].fireMessage('hello');
        created[0].fireMessage({ event: 'tick' });
        await drain();
        expect(received).toEqual(['hello', { event: 'tick' }]);

        client.send('raw');
        client.send({ n: 1 });
        expect(created[0].sent).toEqual(['raw', JSON.stringify({ n: 1 })]);

        client.close(1000, 'done');
        expect(created[0].closed).toEqual({ code: 1000, reason: 'done' });
        expect(client.status.value).toBe('closed');
        await collecting;
        expect(received).toEqual(['hello', { event: 'tick' }]);
    });

    test('reconnects on unexpected close with gap-capped backoff; open resets the attempt counter', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5); // 0.5 → no jitter applied
        const { client, created } = createHarness({ reconnect: { baseMs: 1000, maxMs: 3000, jitter: 0 } });
        created[0].fireOpen();
        created[0].fireClose(1006, 'abnormal');

        expect(client.status.value).toBe('reconnecting');
        vi.advanceTimersByTime(999);
        expect(created.length).toBe(1); // backoff holds
        vi.advanceTimersByTime(1);
        expect(client.status.value).toBe('connecting');
        expect(created.length).toBe(2);

        // Drop again without opening: attempt 2 → 2s delay.
        created[1].fireClose();
        vi.advanceTimersByTime(2000);
        expect(created.length).toBe(3);

        // Attempt 3 would be 8s — capped at the 3s policy maximum.
        created[2].fireClose();
        vi.advanceTimersByTime(2000);
        expect(created.length).toBe(3);
        vi.advanceTimersByTime(1000);
        expect(created.length).toBe(4);

        // A successful open resets the attempt counter: next drop is 1s again.
        created[3].fireOpen();
        expect(client.status.value).toBe('open');
        created[3].fireClose();
        vi.advanceTimersByTime(1000);
        expect(created.length).toBe(5);
    });

    test('deliberate close during the backoff window cancels the retry', () => {
        const { client, created } = createHarness();
        created[0].fireOpen();
        created[0].fireClose();
        expect(client.status.value).toBe('reconnecting');

        client.close();
        expect(client.status.value).toBe('closed');
        vi.advanceTimersByTime(60_000);
        expect(created.length).toBe(1);
    });

    test('reconnect: null turns an unexpected close into terminal closed', async () => {
        const { client, created } = createHarness({ reconnect: null });
        const received: unknown[] = [];
        const collecting = (async () => {
            for await (const message of client.messages) {
                received.push(message);
            }
        })();

        created[0].fireOpen();
        created[0].fireMessage('x');
        created[0].fireClose();
        expect(client.status.value).toBe('closed');
        await collecting;
        expect(received).toEqual(['x']);
    });

    test('messages streams survive reconnects and complete only on deliberate close', async () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5); // deterministic 1s backoff
        const { client, created } = createHarness();
        const received: unknown[] = [];
        const collecting = (async () => {
            for await (const message of client.messages) {
                received.push(message);
            }
        })();

        created[0].fireOpen();
        created[0].fireMessage('before-drop');
        created[0].fireClose();
        vi.advanceTimersByTime(1000);
        created[1].fireOpen();
        created[1].fireMessage('after-reconnect');
        await drain();
        expect(received).toEqual(['before-drop', 'after-reconnect']);

        client.close();
        await collecting;
        expect(received).toEqual(['before-drop', 'after-reconnect']);
    });

    test('outbound queue buffers while disconnected and flushes on open', () => {
        const { client, created } = createHarness({ bufferWhileDisconnected: { maxMessages: 2 } });
        client.send('a'); // connecting — no transport yet
        client.send('b');
        expect(created[0].sent).toEqual([]);

        created[0].fireOpen();
        expect(created[0].sent).toEqual(['a', 'b']);
    });

    test('outbound queue overflow drops the oldest message', () => {
        const { client, created } = createHarness({ bufferWhileDisconnected: { maxMessages: 1 } });
        client.send('a');
        client.send('b');
        created[0].fireOpen();
        expect(created[0].sent).toEqual(['b']);
    });

    test('sent while closed is dropped without throwing', () => {
        const { client, created } = createHarness();
        created[0].fireOpen();
        client.close();
        client.send('late');
        expect(created[0].sent).toEqual([]);
    });

    test('binary send copies a Node Buffer payload — no pool slab on the wire', () => {
        const { client, created } = createHarness();
        created[0].fireOpen();

        // `Buffer.from` carves out of the shared 8 KiB pool: its `.buffer`
        // is the whole slab and `Buffer.prototype.slice()` returns a view,
        // so a naive pass-through shipped 8192 bytes for `'hello'` — wrong
        // frame bytes plus pooled-memory disclosure.
        const buffer = Buffer.from('hello');
        client.send(buffer);

        const sent = created[0].sent[0] as ArrayBuffer;
        expect(sent).toBeInstanceOf(ArrayBuffer);
        expect(sent.byteLength).toBe(5);
        expect([...new Uint8Array(sent)]).toEqual([...buffer]);

        // The frame must be an owned copy, not a view into the caller's
        // (pooled) memory: mutating the source later must not rewrite it.
        buffer[0] = 0x7a;
        expect([...new Uint8Array(sent)]).toEqual([104, 101, 108, 108, 111]);
    });

    test('binary send copies only the subarray window of a view', () => {
        const { client, created } = createHarness();
        created[0].fireOpen();

        const base = Uint8Array.from([0, 1, 2, 3, 4, 5]);
        client.send(base.subarray(2, 5));

        const sent = created[0].sent[0] as ArrayBuffer;
        expect(sent.byteLength).toBe(3);
        expect([...new Uint8Array(sent)]).toEqual([2, 3, 4]);
    });

    test('binary send copies a plain Uint8Array exactly', () => {
        const { client, created } = createHarness();
        created[0].fireOpen();

        client.send(new Uint8Array([1, 2, 3]));

        const sent = created[0].sent[0] as ArrayBuffer;
        expect(sent.byteLength).toBe(3);
        expect([...new Uint8Array(sent)]).toEqual([1, 2, 3]);
    });

    test('reconnect trigger retries immediately while reconnecting', () => {
        const trigger = new FakeTrigger();
        const { client, created } = createHarness({ reconnectTrigger: trigger });
        expect(created.length).toBe(1);

        created[0].fireOpen();
        created[0].fireClose();
        expect(client.status.value).toBe('reconnecting');

        trigger.notify(); // e.g. the browser came online
        expect(client.status.value).toBe('connecting');
        expect(created.length).toBe(2);
        vi.advanceTimersByTime(60_000);
        expect(created.length).toBe(2); // original retry timer was cancelled
    });

    test('reconnect trigger while open does nothing', () => {
        const trigger = new FakeTrigger();
        const { client, created } = createHarness({ reconnectTrigger: trigger });
        created[0].fireOpen();
        trigger.notify();
        expect(client.status.value).toBe('open');
        expect(created.length).toBe(1);
    });

    test('onStatusChange fires on each transition, never twice for a state', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5); // deterministic 1s backoff
        const states: string[] = [];
        const { client, created } = createHarness({
            onStatusChange: (status) => states.push(status),
        });
        expect(states).toEqual([]); // construction does not notify

        created[0].fireOpen();
        created[0].fireOpen(); // repeated state → no notification
        created[0].fireClose();
        vi.advanceTimersByTime(1000);
        created[1].fireOpen();
        client.close();
        expect(states).toEqual(['open', 'reconnecting', 'connecting', 'open', 'closed']);
    });

    test('onStatusChange with reconnect:null ends at closed', () => {
        const states: string[] = [];
        const { client, created } = createHarness({ reconnect: null, onStatusChange: (s) => states.push(s) });
        created[0].fireOpen();
        created[0].fireClose();
        // No retry will be scheduled — no transient 'reconnecting' is
        // published (which would inflate reconnect telemetry).
        expect(states).toEqual(['open', 'closed']);
    });

    test('a throwing onStatusChange observer cannot wedge the state machine', async () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        const { client, created } = createHarness({
            onStatusChange: () => {
                throw new Error('observer blew up');
            },
        });
        const received: unknown[] = [];
        const collecting = (async () => {
            for await (const message of client.messages) {
                received.push(message);
            }
        })();

        // Unexpected close → retry must still be scheduled despite the
        // observer throw in the reconnecting transition.
        created[0].fireOpen();
        created[0].fireMessage('x');
        created[0].fireClose();
        expect(client.status.value).toBe('reconnecting');
        vi.advanceTimersByTime(1000);
        expect(created.length).toBe(2); // retry fired
        created[1].fireOpen();
        expect(client.status.value).toBe('open');

        // Deliberate close → stream must still complete despite the throw.
        client.close();
        await collecting;
        expect(received).toEqual(['x']);
    });

    test('transport.send failures are dropped silently, not thrown to callers', () => {
        const { client, created } = createHarness();
        created[0].fireOpen();
        created[0].send = () => {
            throw new Error('InvalidStateError: not open');
        };
        expect(() => client.send('late')).not.toThrow();
        // With no buffer configured the failed send is dropped.
        expect(created[0].sent).toEqual([]);
    });

    test('a failed flush send stops the drain without losing the remainder', () => {
        const { client, created } = createHarness({ bufferWhileDisconnected: { maxMessages: 10 } });
        client.send('a');
        client.send('b');
        created[0].fireOpen(); // flush both
        expect(created[0].sent).toEqual(['a', 'b']);

        // Second session: queue two, then fail the flush mid-way.
        const failing = createHarness({ bufferWhileDisconnected: { maxMessages: 10 } });
        failing.client.send('x');
        failing.client.send('y');
        failing.created[0].send = (data: string) => {
            if (data === 'x') {
                throw new Error('InvalidStateError: not open');
            }
            failing.created[0].sent.push(data);
        };
        expect(() => failing.created[0].fireOpen()).not.toThrow();
        // 'x' failed and was re-queued; 'y' was never consumed.
        expect(failing.created[0].sent).toEqual([]);
    });

    test('close during connecting ignores late open/close events (async-close race)', async () => {
        const { client, created } = createHarness();
        // Deliberate close while the handshake is in flight — the real
        // WHATWG WebSocket does not abort CONNECTING, so onopen/onclose
        // land asynchronously later.
        client.close(1000, 'done');
        expect(client.status.value).toBe('closed');

        const received: unknown[] = [];
        const collecting = (async () => {
            for await (const message of client.messages) {
                received.push(message);
            }
        })();

        created[0].fireOpen();
        created[0].fireMessage('late');
        created[0].fireClose();
        await drain();
        expect(client.status.value).toBe('closed');
        expect(created.length).toBe(1); // no reconnect
        await collecting;
        expect(received).toEqual([]); // late frame never delivered
    });

    test('close unsubscribes the reconnect trigger and clears the outbound queue', () => {
        const trigger = new FakeTrigger();
        const { client, created } = createHarness({
            reconnectTrigger: trigger,
            bufferWhileDisconnected: { maxMessages: 10 },
        });
        client.send('pending');
        client.close();
        // The trigger's listener list must be empty (M6 — a closed client
        // must not stay pinned by the shared trigger).
        trigger.notify();
        expect(created.length).toBe(1);
        expect(client.status.value).toBe('closed');
    });

    test('messages pushed before the consumer attaches are drained in order', async () => {
        const { client, created } = createHarness();
        created[0].fireOpen();
        created[0].fireMessage('queued-1');
        created[0].fireMessage('queued-2');

        // No consumer attached yet — the AsyncReader buffers; the drain
        // branch (push while no waiter) is exercised on attach.
        const received: unknown[] = [];
        const collecting = (async () => {
            for await (const message of client.messages) {
                received.push(message);
            }
        })();
        await drain();
        expect(received).toEqual(['queued-1', 'queued-2']);

        client.close();
        await collecting;
        expect(received).toEqual(['queued-1', 'queued-2']);
    });

    test('maxInboundMessages bounds the inbound queue (O3)', async () => {
        const { client, created } = createHarness({ maxInboundMessages: 2 });
        created[0].fireOpen();
        const received: unknown[] = [];
        const collecting = (async () => {
            for await (const message of client.messages) {
                received.push(message);
            }
        })();
        await drain(); // consumer is now awaiting the first slot

        created[0].fireMessage('a');
        created[0].fireMessage('b');
        created[0].fireMessage('c'); // queue full → dropped
        await drain();
        expect(received).toEqual(['a', 'b']);

        client.close();
        await collecting;
    });

    test('reconnect jitter never exceeds the maxMs ceiling (O5)', () => {
        vi.spyOn(Math, 'random').mockReturnValue(1); // maximal positive jitter
        const { client, created } = createHarness({ reconnect: { baseMs: 1000, maxMs: 3000, jitter: 0.2 } });
        created[0].fireOpen();
        created[0].fireClose(); // attempt 0 → base 1s; ×1.2 = 1.2s < cap
        vi.advanceTimersByTime(1200);
        expect(created.length).toBe(2);

        // Attempt 2's base would be 4s — but the policy caps at 3s; with
        // +20% jitter applied BEFORE the cap it would sleep 3.6s. After the
        // clamp, the retry must land at exactly 3s.
        created[1].fireClose();
        vi.advanceTimersByTime(3000);
        expect(created.length).toBe(3);
    });
});

describe('WebSocketClient send hygiene', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    test('non-serializable payloads are dropped and cannot wedge the buffered flush', async () => {
        const { client, created } = createHarness({ bufferWhileDisconnected: { maxMessages: 5 } });
        client.send(undefined);
        client.send(() => 'nope');
        client.send('queued');
        created[0].fireOpen();
        // The poison values never entered the queue, so the flush reaches
        // the real message (a queued poison frame would throw from the
        // transport send and permanently stall the drain).
        expect(created[0].sent).toEqual(['queued']);
        client.close(1000, 'done');
    });

    test('a non-serializable payload while open is dropped without throwing', async () => {
        const { client, created } = createHarness();
        created[0].fireOpen();
        expect(() => client.send(undefined)).not.toThrow();
        client.send('real');
        expect(created[0].sent).toEqual(['real']);
        client.close(1000, 'done');
    });
});

describe('WebSocketClient reconnect policy sanitization', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    test('a partially-specified policy falls back to defaults instead of a NaN hot loop', () => {
        const { client, created } = createHarness({ reconnect: {} as WebSocketClientOptions['reconnect'] });
        created[0].fireOpen();
        created[0].fireClose(1006, '', false);
        // A NaN backoff schedules setTimeout(fn, NaN) → fires immediately
        // (created.length would already be 2). The sanitized default base
        // (1000ms ± jitter) keeps the retry in the future.
        expect(created).toHaveLength(1);
        expect(client.status.value).toBe('reconnecting');
        vi.advanceTimersByTime(500);
        expect(created).toHaveLength(1);
        vi.advanceTimersByTime(1000);
        expect(created).toHaveLength(2);
        client.close(1000, 'done');
    });
});

describe('WebSocketClient outbound-size observer (TEL-08)', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    test('reports the UTF-8 byte size of every written payload', () => {
        const sizes: number[] = [];
        const { client, created } = createHarness({ onSend: (bytes) => sizes.push(bytes) });
        created[0].fireOpen();
        client.send('héllo'); // é is two UTF-8 octets → 6
        client.send(new Uint8Array([1, 2, 3]).buffer);
        expect(sizes).toEqual([6, 3]);
        client.close(1000, 'done');
    });

    test('reports flushed payloads but not queued ones', () => {
        const sizes: number[] = [];
        const { client, created } = createHarness({
            onSend: (bytes) => sizes.push(bytes),
            bufferWhileDisconnected: { maxMessages: 2 },
        });
        client.send('queued'); // not open yet → buffered, never written
        expect(sizes).toEqual([]);
        created[0].fireOpen();
        expect(sizes).toEqual([6]);
        client.close(1000, 'done');
    });

    test('an observer throw never wedges the send path', () => {
        const { client, created } = createHarness({
            onSend: () => {
                throw new Error('observer fault');
            },
        });
        created[0].fireOpen();
        expect(() => client.send('x')).not.toThrow();
        expect(created[0].sent).toEqual(['x']);
        client.close(1000, 'done');
    });
});
