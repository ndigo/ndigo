/**
 * Isomorphic WebSocket client — WHATWG `WebSocket`-based (AD-22 D3).
 *
 * Runs on the same interface surface in browsers and Node ≥22 (undici
 * global), so the client lives in the isomorphic `@blue/socket` package:
 * signal-based connection status, async-iterable messages, reconnect with
 * backoff + jitter on unexpected close, and an opt-in bounded outbound
 * queue while disconnected.
 * * @module blue-socket
 * @since 1.0.0
 * @author Jeff Rose
 */
import { signal, type Signal } from '@blue/signals';

/**
 * Connection lifecycle states.
 *
 * - `connecting` — initial connect or a reconnect attempt in flight.
 * - `open` — messages flow both ways.
 * - `reconnecting` — the peer dropped unexpectedly; a retry is scheduled.
 * - `closed` — deliberate close (or `reconnect: null` after a drop);
 *   terminal, never reconnects (AD-22 D3).
 */
export type SocketStatus = 'connecting' | 'open' | 'reconnecting' | 'closed';

/**
 * The structural WHATWG `WebSocket` subset the client depends on.
 *
 * `WebSocketClient` never touches transports outside this surface, which is
 * exactly what browsers and Node ≥22 both implement — and what the unit
 * transport doubles implement.
 */
export interface SocketTransport {
    /** Binary frame delivery mode. Defaults to `'arraybuffer'` in the client. */
    binaryType?: 'blob' | 'arraybuffer';
    onopen: ((event: unknown) => void) | null;
    onmessage: ((event: { data: unknown }) => void) | null;
    onclose: ((event: { code: number; reason: string; wasClean: boolean }) => void) | null;
    onerror: ((event: unknown) => void) | null;
    /** Send a text (or binary) frame. */
    send(data: string): void;
    /** Initiate (or coerce) a close handshake. */
    close(code?: number, reason?: string): void;
}

/**
 * Exponential backoff policy for unexpected-close reconnects (AD-22 D3).
 */
export interface ReconnectPolicy {
    /** First delay in ms (default `1000`). */
    baseMs: number;
    /** Delay ceiling in ms (default `30_000`). */
    maxMs: number;
    /** Random jitter fraction, `0`–`1` (default `0.2` = ±20%). */
    jitter: number;
}

/**
 * Environment wiring for an immediate retry (e.g. the browser `online`
 * event — `blue-platform-web` provides an implementation).
 */
export interface ReconnectTrigger {
    /**
     * Subscribe to connection-relevant changes (online events, …).
     *
     * @param listener - Invoked when the environment state changes; the
     *   client reconnects immediately if it is currently reconnecting.
     * @returns An unsubscribe function.
     */
    onChange(listener: () => void): () => void;
}

/**
 * Options for {@link WebSocketClient}.
 */
export interface WebSocketClientOptions {
    /**
     * Reconnect policy. `null` disables auto-reconnect (an unexpected
     * close ends in `closed`). Omit for the default policy.
     */
    reconnect?: ReconnectPolicy | null;
    /**
     * Opt-in bounded outbound queue for messages sent while not `open`
     * (connecting/reconnecting). Overflow drops the **oldest** message.
     * Default: no queue — messages sent while disconnected are dropped.
     */
    bufferWhileDisconnected?: { maxMessages: number };
    /** Immediate-retry wiring (AD-22 D3); `null` disables. */
    reconnectTrigger?: ReconnectTrigger | null;
    /**
     * Status-transition observer: invoked on every state change
     * (`connecting | open | reconnecting | closed`), never on construction
     * and not twice for the same state — the telemetry seam for status and
     * reconnect metrics (constructor-injected like `reconnectTrigger`).
     */
    onStatusChange?: (status: SocketStatus) => void;
    /**
     * Transport factory for tests and non-standard environments. Defaults
     * to the WHATWG `WebSocket` global (browser + Node ≥22).
     * @internal
     */
    transportFactory?: (url: string) => SocketTransport;
}

/**
 * The client contract — what handlers, views, and services consume.
 */
export interface SocketClient {
    /** The endpoint URL the client connects to. */
    readonly url: string;
    /** Reactive connection state (`@blue/signals` signal, AD-22 D3). */
    readonly status: Signal<SocketStatus>;
    /**
     * Inbound messages as an async iterable. Text frames arrive as
     * strings; binary frames as `ArrayBuffer`s. The stream completes only
     * on a **deliberate** close — unexpected drops pause, then continue
     * after reconnect.
     */
    readonly messages: AsyncIterable<unknown>;
    /**
     * Send: strings as text frames, anything else JSON-encoded. Sent while
     * disconnected: queued (when `bufferWhileDisconnected` is set, overflow
     * drops oldest) or dropped silently.
     */
    send(data: unknown): void;
    /**
     * Deliberate close — never triggers a reconnect (AD-22 D3).
     *
     * @param code - Close status code (default `1000` normal).
     * @param reason - Human-readable close reason.
     */
    close(code?: number, reason?: string): void;
}

const DEFAULT_RECONNECT: ReconnectPolicy = Object.freeze({ baseMs: 1_000, maxMs: 30_000, jitter: 0.2 });

/**
 * Default transport: the WHATWG global. The cast is deliberate — the
 * global's full surface is wider than the documented `SocketTransport`
 * subset the client touches (browser and Node ≥22 both implement it).
 */
function defaultTransportFactory(url: string): SocketTransport {
    return new WebSocket(url) as unknown as SocketTransport;
}

/**
 * A minimal async iterable built from push + complete events.
 *
 * Bridges the event-driven transport to `for await` consumers without
 * buffering the whole stream: pushed values are queued; consumers await the
 * next slot. `complete()` (deliberate close) ends the stream after the
 * remaining queue has drained.
 */
class AsyncReader<T> {
    readonly #queue: T[] = [];
    readonly #waiter: Array<() => void> = [];
    #completed = false;

    push(value: T): void {
        const waiter = this.#waiter.shift();
        if (waiter) {
            waiter();
        }
        this.#queue.push(value);
    }

    complete(): void {
        this.#completed = true;
        while (this.#waiter.length > 0) {
            const waiter = this.#waiter.shift();
            if (waiter) {
                waiter();
            }
        }
    }

    async *iterable(): AsyncGenerator<T> {
        while (true) {
            while (this.#queue.length > 0) {
                yield this.#queue.shift() as T;
            }
            if (this.#completed) {
                return;
            }
            // eslint-disable-next-line no-await-in-loop -- consumer-pull iterator: each iteration awaits a fresh "next value available" signal; parallelizing is impossible (single stream, ordering required).
            await new Promise<void>((resolve) => this.#waiter.push(resolve));
        }
    }
}

/**
 * WHATWG-`WebSocket`-based client with reconnect (AD-22 D3).
 *
 * @example
 * ```ts
 * const chat = new WebSocketClient('ws://localhost:3000/ws/chat', {
 *     bufferWhileDisconnected: { maxMessages: 100 },
 * });
 * effect(() => {
 *     if (chat.status.value === 'open') panel.hidden = false;
 * });
 * for await (const message of chat.messages) {
 *     applyMessage(JSON.parse(String(message)));
 * }
 * ```
 */
export class WebSocketClient implements SocketClient {
    readonly url: string;
    readonly status: Signal<SocketStatus> = signal<SocketStatus>('connecting');
    readonly #reconnect: ReconnectPolicy | null;
    readonly #bufferLimit: number | null;
    readonly #trigger: ReconnectTrigger | null;
    readonly #onStatusChange: ((status: SocketStatus) => void) | null;
    readonly #transportFactory: (url: string) => SocketTransport;
    readonly #inbound: AsyncReader<unknown> = new AsyncReader<unknown>();
    #transport: SocketTransport | null = null;
    #intentional = false;
    #attempt = 0;
    #timer: number | NodeJS.Timeout | null = null;
    #outbound: string[] = [];

    /**
     * @param url - The endpoint URL (e.g. `ws://host/ws/chat`).
     * @param options - Reconnect/buffering/trigger/transport options.
     */
    constructor(url: string, options: WebSocketClientOptions = {}) {
        this.url = url;
        const configured = options.reconnect;
        this.#reconnect = configured === undefined ? DEFAULT_RECONNECT : configured;
        this.#bufferLimit = options.bufferWhileDisconnected?.maxMessages ?? null;
        this.#trigger = options.reconnectTrigger ?? null;
        this.#onStatusChange = options.onStatusChange ?? null;
        this.#transportFactory = options.transportFactory ?? defaultTransportFactory;
        this.#trigger?.onChange(() => this.#retryNow());
        this.#connect();
    }

    get messages(): AsyncIterable<unknown> {
        return this.#inbound.iterable();
    }

    /**
     * Send a message to the peer (see {@link SocketClient.send}).
     *
     * @param data - The payload.
     */
    send(data: unknown): void {
        const payload = typeof data === 'string' ? data : JSON.stringify(data);
        const transport = this.#transport;
        if (transport !== null && this.status.value === 'open') {
            transport.send(payload);
            return;
        }
        if (this.#bufferLimit !== null && this.status.value !== 'closed') {
            this.#outbound.push(payload);
            if (this.#outbound.length > this.#bufferLimit) {
                this.#outbound.shift();
            }
        }
    }

    /**
     * Deliberate close — latches, cancels any pending retry, and completes
     * the message stream (AD-22 D3).
     *
     * @param code - Close status code (default `1000` normal).
     * @param reason - Human-readable close reason.
     */
    close(code: number = 1000, reason: string = ''): void {
        if (this.#intentional) {
            return;
        }
        this.#intentional = true;
        if (this.#timer !== null) {
            clearTimeout(this.#timer);
            this.#timer = null;
        }
        this.#transport?.close(code, reason);
        this.#transition('closed');
        this.#inbound.complete();
    }

    #connect(): void {
        const transport = this.#transportFactory(this.url);
        this.#transport = transport;
        transport.binaryType = 'arraybuffer';
        transport.onopen = () => {
            if (this.#intentional) {
                return;
            }
            this.#attempt = 0;
            this.#transition('open');
            this.#flush();
        };
        transport.onmessage = (event) => {
            if (!this.#intentional) {
                this.#inbound.push(event.data);
            }
        };
        transport.onerror = () => undefined;
        transport.onclose = () => {
            if (this.#intentional) {
                this.#transition('closed');
                this.#inbound.complete();
                return;
            }
            this.#transition('reconnecting');
            this.#scheduleRetry();
        };
    }

    #scheduleRetry(): void {
        if (this.#reconnect === null || this.#intentional) {
            this.#transition('closed');
            this.#inbound.complete();
            return;
        }
        if (this.#timer !== null) {
            return;
        }
        const policy = this.#reconnect;
        const delay = Math.min(policy.baseMs * Math.pow(2, this.#attempt), policy.maxMs);
        const jittered = delay * (1 - policy.jitter + Math.random() * 2 * policy.jitter);
        this.#attempt += 1;
        this.#timer = setTimeout(
            () => {
                this.#timer = null;
                this.#transition('connecting');
                this.#connect();
            },
            Math.max(0, jittered)
        );
    }

    #retryNow(): void {
        if (this.status.value !== 'reconnecting' || this.#intentional) {
            return;
        }
        if (this.#timer !== null) {
            clearTimeout(this.#timer);
            this.#timer = null;
        }
        this.#transition('connecting');
        this.#connect();
    }

    /**
     * The single status choke point: sets the signal and notifies the
     * `onStatusChange` observer — never twice for the same state.
     *
     * @param next - The next connection state.
     */
    #transition(next: SocketStatus): void {
        if (this.status.value === next) {
            return;
        }
        this.status.value = next;
        this.#onStatusChange?.(next);
    }

    #flush(): void {
        const transport = this.#transport;
        while (transport !== null && this.#outbound.length > 0 && this.status.value === 'open') {
            transport.send(this.#outbound.shift() as string);
        }
    }
}
