/**
 * Public WebSocket client contracts.
 */
import type { Signal } from '@ndigo/signals';

export type SocketStatus = 'connecting' | 'open' | 'reconnecting' | 'closed';

/**
 * The structural WHATWG `WebSocket` subset the client depends on.
 *
 * `WebSocketClient` never touches transports outside this surface, which is
 * exactly what browsers and Node ≥24 both implement — and what the unit
 * transport doubles implement.
 *
 * @example
 * ```ts
 * const transport: SocketTransport = new WebSocket('ws://localhost:8080/ws');
 * ```
 */
export interface SocketTransport {
    /** Binary frame delivery mode. Defaults to `'arraybuffer'` in the client. */
    binaryType?: 'blob' | 'arraybuffer';
    /** Called when the connection opens. */
    onopen: ((event: unknown) => void) | null;
    /** Called for each inbound frame. */
    onmessage: ((event: { data: unknown }) => void) | null;
    /** Called when the connection closes. */
    onclose: ((event: { code: number; reason: string; wasClean: boolean }) => void) | null;
    /** Called on transport errors. */
    onerror: ((event: unknown) => void) | null;
    /**
     * Send a text (or binary) frame.
     *
     * @param data - The frame payload.
     */
    send(data: string | ArrayBuffer): void;
    /**
     * Initiate (or coerce) a close handshake.
     *
     * @param code - Close status code (default `1000` normal).
     * @param reason - Human-readable close reason.
     */
    close(code?: number, reason?: string): void;
}

/**
 * Exponential backoff policy for unexpected-close reconnects.
 *
 * @example
 * ```ts
 * const policy: ReconnectPolicy = { initialDelay: 1000, maxDelay: 30000 };
 * ```
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
 * event — `ndigo-platform-web` provides an implementation).
 *
 * @example
 * ```ts
 * const value = {} as ReconnectTrigger;
 * ```
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
 * Options for `WebSocketClient`.
 *
 * @example
 * ```ts
 * const options: WebSocketClientOptions = { url: 'ws://localhost:8080/ws' };
 * ```
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
    /**
     * Opt-in bound on the inbound `messages` stream. A consumer that stops
     * draining (hidden tab, throttled render) otherwise lets the inbound
     * queue grow without limit while the transport keeps delivering. On
     * overflow the **newest** frame is dropped and the reader enters a
     * drop-all state (mirrors the server's overflow posture) — the stream
     * keeps draining what was queued. Default: unbounded.
     */
    maxInboundMessages?: number;
    /** Immediate-retry wiring; `null` disables. */
    reconnectTrigger?: ReconnectTrigger | null;
    /**
     * Status-transition observer: invoked on every state change
     * (`connecting | open | reconnecting | closed`), never on construction
     * and not twice for the same state — the telemetry seam for status and
     * reconnect metrics (constructor-injected like `reconnectTrigger`).
     */
    onStatusChange?: (status: SocketStatus) => void;
    /**
     * Outbound-size observer: invoked with the UTF-8 byte length of every
     * payload actually written to the transport (direct sends and buffered
     * flushes alike, never for queued/dropped payloads) — the byte-counter
     * seam for telemetry, which would otherwise re-serialize each payload.
     * Constructor-injected like `onStatusChange`; a throw is isolated.
     */
    onSend?: (bytes: number) => void;
    /**
     * Transport factory for tests and non-standard environments. Defaults
     * to the WHATWG `WebSocket` global (browser + Node ≥24).
     * @internal
     */
    transportFactory?: (url: string) => SocketTransport;
}

/**
 * The client contract — what handlers, views, and services consume.
 *
 * @example
 * ```ts
 * const client: SocketClient = new SocketClient('ws://localhost:8080/ws');
 * await client.connect();
 * ```
 */
export interface SocketClient {
    /** The endpoint URL the client connects to. */
    readonly url: string;
    /** Reactive connection state (`@ndigo/signals` signal). */
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
     *
     * @param data - The payload to send.
     */
    send(data: unknown): void;
    /**
     * Deliberate close — never triggers a reconnect.
     *
     * @param code - Close status code (default `1000` normal).
     * @param reason - Human-readable close reason.
     */
    close(code?: number, reason?: string): void;
    /**
     * Whether the client reports exact wire sizes through the `onSend`
     * observer (TEL-08). Telemetry reads this to skip its own payload
     * estimation for wired clients — counting both would double the byte
     * metric.
     */
    readonly onSendWired: boolean;
}
