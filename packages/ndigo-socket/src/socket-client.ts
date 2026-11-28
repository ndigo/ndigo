/**
 * Isomorphic WebSocket client — WHATWG `WebSocket`-based.
 *
 * Runs on the same interface surface in browsers and Node ≥24 (undici
 * global), so the client lives in the isomorphic `@ndigo/socket` package:
 * signal-based connection status, async-iterable messages, reconnect with
 * backoff + jitter on unexpected close, and an opt-in bounded outbound
 * queue while disconnected.
 */
import { signal, type Signal } from '@ndigo/signals';
import { AsyncReader } from './async-reader.js';
import { DEFAULT_RECONNECT, defaultTransportFactory } from './_socket-client-transport.js';
import { SocketOutboundQueue } from './_socket-client-outbound.js';
import type {
    ReconnectPolicy,
    ReconnectTrigger,
    SocketClient,
    SocketStatus,
    SocketTransport,
    WebSocketClientOptions,
} from './socket-client-types.js';

export * from './socket-client-types.js';

/**
 * WHATWG-`WebSocket`-based client with reconnect.
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
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "WebSocketClient".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object WebSocketClient]"
     */
    get [Symbol.toStringTag](): string {
        return 'WebSocketClient';
    }

    /** The endpoint URL. */
    readonly url: string;
    /** The live connection status. */
    readonly status: Signal<SocketStatus> = signal<SocketStatus>('connecting');
    readonly #reconnect: ReconnectPolicy | null;
    readonly #trigger: ReconnectTrigger | null;
    readonly #onStatusChange: ((status: SocketStatus) => void) | null;
    readonly #transportFactory: (url: string) => SocketTransport;
    readonly #inbound: AsyncReader<unknown>;
    #transport: SocketTransport | null = null;
    #intentional = false;
    #attempt = 0;
    #timer: number | NodeJS.Timeout | null = null;
    /** Outbound buffer while disconnected (bounded, order-preserving). */
    readonly #outbound: SocketOutboundQueue;
    #unsubscribeTrigger: (() => void) | null = null;

    /**
     * Creates a client and starts connecting.
     *
     * @param url - The endpoint URL (e.g. `ws://host/ws/chat`).
     * @param options - Reconnect/buffering/trigger/transport options.
     */
    constructor(url: string, options: WebSocketClientOptions = {}) {
        this.url = url;
        const configured = options.reconnect;
        this.#reconnect = configured === undefined ? DEFAULT_RECONNECT : configured;
        this.#trigger = options.reconnectTrigger ?? null;
        this.#onStatusChange = options.onStatusChange ?? null;
        this.#transportFactory = options.transportFactory ?? defaultTransportFactory;
        this.#outbound = new SocketOutboundQueue(
            options.bufferWhileDisconnected?.maxMessages ?? null,
            options.onSend ?? null
        );
        // Inbound watermark (opt-in): while the queue is at the cap, the newest
        // frame is dropped and the reader reports one overflow episode; the
        // stream resumes once the consumer drains below the cap (mirrors
        // the server's overflow posture).
        this.#inbound = new AsyncReader<unknown>(options.maxInboundMessages ?? Number.POSITIVE_INFINITY);
        // Keep the unsubscribe: a shared trigger (e.g. the browser global
        // `createOnlineReconnectTrigger`) otherwise pins every closed client
        // in its listener list forever (M6).
        this.#unsubscribeTrigger = this.#trigger?.onChange(() => this.#retryNow()) ?? null;
        this.#connect();
    }

    /** Whether the client reports exact wire sizes through `onSend` (TEL-08). */
    get onSendWired(): boolean {
        return this.#outbound.onSendWired;
    }

    /** Inbound messages as an async iterable. */
    get messages(): AsyncIterable<unknown> {
        return this.#inbound.iterable();
    }

    /**
     * Send a message to the peer (see {@link SocketClient.send}).
     *
     * @param data - The payload.
     */
    send(data: unknown): void {
        let payload: string | ArrayBuffer;
        if (typeof data === 'string') {
            payload = data;
        } else if (data instanceof ArrayBuffer) {
            payload = data;
        } else if (data instanceof Uint8Array) {
            // Copy the view window: a Node `Buffer` is a `Uint8Array` over
            // the shared 8 KiB pool — `Buffer.prototype.slice()` returns a
            // view (it does not copy) and `.buffer` is the whole slab, so
            // passing either through would put pooled memory on the wire.
            payload = new Uint8Array(data).buffer;
        } else {
            const serialized = JSON.stringify(data);
            if (serialized === undefined) {
                // Non-serializable (undefined/function/symbol): no frame can
                // be produced — and a falsy payload must never reach the
                // buffer, where the flush would throw on it forever and
                // permanently wedge the outbound queue. Drop silently per
                // the send contract. (Circular structures still throw out
                // of `JSON.stringify` — a caller bug, surfaced loudly.)
                return;
            }
            payload = serialized;
        }
        const transport = this.#transport;
        if (transport !== null && this.status.value === 'open') {
            try {
                transport.send(payload as string | ArrayBuffer);
                this.#outbound.notify(payload as string | ArrayBuffer);
                return;
            } catch {
                // The status signal lags the wire: between the peer starting
                // the close handshake (or the TCP drop) and this transport's
                // onclose, WHATWG `send()` throws InvalidStateError. Fall
                // through to the disconnected path below — queue or drop
                // per `bufferWhileDisconnected`.
            }
        }
        if (this.status.value !== 'closed') {
            this.#outbound.push(payload as string | ArrayBuffer);
        }
    }

    /**
     * Deliberate close — latches, cancels any pending retry, and completes
     * the message stream.
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
        // Release the reconnect-trigger subscription and drop queued
        // outbound: the client is terminal, nothing must keep it alive or
        // send later.
        this.#unsubscribeTrigger?.();
        this.#unsubscribeTrigger = null;
        this.#outbound.clear();
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
            this.#outbound.flush(transport, () => this.status.value === 'open');
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
            if (this.#reconnect === null) {
                // No retry will be scheduled — go straight to terminal
                // 'closed' instead of publishing a transient 'reconnecting'
                // (which would inflate reconnect metrics).
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
        // Runtime-constructed policies (JSON/env config) may omit fields or
        // carry non-numeric values — a NaN delay would become an
        // immediate-retry hot loop (a new WebSocket per tick). Sanitize
        // each field against the documented defaults.
        const baseMs = Number.isFinite(policy.baseMs) && policy.baseMs >= 0 ? policy.baseMs : DEFAULT_RECONNECT.baseMs;
        const maxMs = Number.isFinite(policy.maxMs) && policy.maxMs >= 0 ? policy.maxMs : DEFAULT_RECONNECT.maxMs;
        const jitter = Number.isFinite(policy.jitter)
            ? Math.min(1, Math.max(0, policy.jitter))
            : DEFAULT_RECONNECT.jitter;
        const base = Math.min(baseMs * Math.pow(2, this.#attempt), maxMs);
        // Jitter then clamp so `maxMs` is a true ceiling (jitter outside the
        // cap would push sleeps to base×1.2 → beyond the documented max).
        const delay = Math.min(maxMs, base * (1 - jitter + Math.random() * 2 * jitter));
        this.#attempt += 1;
        this.#timer = setTimeout(
            () => {
                this.#timer = null;
                this.#transition('connecting');
                this.#connect();
            },
            Math.max(0, delay)
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
     * App-injected observers (the telemetry seam, effect subscriptions on the
     * status signal) must never wedge the state machine: a throw here would
     * skip the caller's post-transition work — `#scheduleRetry`, `#connect`,
     * or `#inbound.complete()` — leaving the client permanently stuck (and
     * in Node, an uncaught exception in a timer callback terminates the
     * process). Both the signal write (synchronous listener dispatch) and
     * the observer call are isolated.
     *
     * @param next - The next connection state.
     */
    #transition(next: SocketStatus): void {
        if (this.status.value === next) {
            return;
        }
        try {
            this.status.value = next;
            this.#onStatusChange?.(next);
        } catch {
            // Observer/effect fault — status is already set; the state
            // machine continues regardless.
        }
    }
}
