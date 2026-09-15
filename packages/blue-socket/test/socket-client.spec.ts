/**
 * `WebSocketClient` unit tests — WHATWG-shaped transport doubles + fake
 * timers (no real sockets). Covers connect/message parity, reconnect
 * backoff + jitter, deliberate-close latching, the optional outbound queue,
 * and the reconnect trigger (AD-22 D3).
 * @module blue-socket
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocketClient, type ReconnectTrigger, type SocketTransport, type WebSocketClientOptions } from '../src/index';

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
    readonly sent: string[] = [];
    closed: { code: number; reason: string } | null = null;

    send(data: string): void {
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
        for (const listener of [...this.#listeners]) {
            listener();
        }
    }
}

function createHarness(
    options: Partial<Pick<WebSocketClientOptions, 'reconnect' | 'bufferWhileDisconnected' | 'reconnectTrigger'>> = {}
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
    for (let index = 0; index < 32; index++) {
        await Promise.resolve();
    }
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
});