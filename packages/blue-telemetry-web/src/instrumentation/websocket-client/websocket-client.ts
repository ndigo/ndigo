/**
 * OpenTelemetry instrumentation for the `@blue/socket` client.
 * @module blue-telemetry-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { metrics } from '@opentelemetry/api';
import type { Attributes, Counter } from '@opentelemetry/api';
import { WebSocketClient, type SocketStatus } from '@blue/socket';
import { AbstractBaseInstrumentation } from '@blue/telemetry';

/**
 * Instrumentation for {@link WebSocketClient} (AD-22): outbound message
 * and byte counters + exactly one counted `close()` per session (a close
 * that follows a terminal drop counts; the latched repeat does not), via
 * prototype patches.
 *
 * Status/reconnect metrics are **not** patchable (the client's status
 * signal lives on app-constructed instances) — wire
 * {@link countSocketClientStatus} into the `onStatusChange` option instead.
 *
 * @example
 * ```ts
 * // configureBrowserTelemetry already ran — hand it the registration you use
 * // for the shared instrumentations (or wrap the client directly):
 * new WebSocketClient(url, {
 *     onStatusChange: countSocketClientStatus(),
 * });
 * ```
 */
export class WebSocketClientInstrumentation extends AbstractBaseInstrumentation {
    constructor() {
        super('websocket-client');
    }

    enable(): void {
        // `InstrumentationBase` calls `enable()` from ITS constructor and on
        // every SDK `registerInstrumentations` — a second enable must not
        // re-wrap the already-wrapped methods (browser-platform `_wrap` is
        // plain shimmer.wrap: double-wrapping would double every counter and
        // leave the inner wrapper in place after a single `disable`). The
        // latch mirrors the sibling server instrumentation's ENABLED set.
        if (ENABLED.has(this)) {
            return;
        }
        ENABLED.add(this);
        // Counters are resolved lazily on first use, not at `enable()` time:
        // `InstrumentationBase` calls `enable()` in its constructor, before
        // any SDK has registered a global MeterProvider — an eager
        // `metrics.getMeter(...).createCounter(...)` would capture the
        // NoopMeter and silently drop every datapoint. The first wrapped
        // call runs after SDK init, so the global meter is real by then.
        const counter = (() => {
            const cache = new Map<string, Counter>();
            return (name: string, attributes?: Attributes, value: number = 1): void => {
                let instrument = cache.get(name);
                if (instrument === undefined) {
                    instrument = metrics.getMeter('@blue/telemetry').createCounter(name);
                    cache.set(name, instrument);
                }
                instrument.add(value, attributes);
            };
        })();

        this._wrap(WebSocketClient.prototype, 'send', (original) => {
            return function (this: unknown, data: unknown): void {
                counter('blue.socket.client.messages.sent');
                counter('blue.socket.client.messages.bytes', undefined, payloadBytes(data));
                return original.apply(this, [data]);
            };
        });

        this._wrap(WebSocketClient.prototype, 'close', (original) => {
            return function (this: unknown, code?: number, reason?: string): void {
                // One terminal close per session. close() latches on the
                // client, so the repeat calls a defensive teardown makes are
                // no-ops that must not inflate the metric — but the first
                // call after an unexpected terminal drop *is* the session's
                // terminal close and must count, even though the status
                // signal already reads `closed`. Both cases leave the status
                // `closed`, so the status alone cannot separate them; the
                // per-client latch below does (the server instrumentation
                // likewise counts only real removals).
                const client = this as WebSocketClient;
                if (!COUNTED_CLOSES.has(client)) {
                    COUNTED_CLOSES.add(client);
                    counter('blue.socket.client.closes', { 'socket.close_code': code ?? 1000 });
                }
                return original.apply(this, [code, reason]);
            };
        });
    }

    disable(): void {
        ENABLED.delete(this);
        this._unwrap(WebSocketClient.prototype, 'send');
        this._unwrap(WebSocketClient.prototype, 'close');
    }
}

/** Enable latch — see {@link WebSocketClientInstrumentation.enable}. */
const ENABLED = new WeakSet<WebSocketClientInstrumentation>();

/**
 * Clients whose terminal close has already been counted. `close()` latches
 * on the client (a second call is a no-op) and the public surface exposes
 * no latch state, so the status signal cannot tell a latched repeat — the
 * status is already `closed` because a deliberate close ran — from the
 * real close a client issues after an unexpected drop. Recording the
 * first counted call puts every session in exactly one terminal bucket.
 */
const COUNTED_CLOSES = new WeakSet<WebSocketClient>();

/**
 * Status-transition metric wiring for a `WebSocketClient` — use as the
 * client's `onStatusChange` option (constructor-injected seam; the client
 * is app-constructed, so prototype patches cannot see its signal):
 *
 * ```ts
 * const count = countSocketClientStatus();
 * const chat = new WebSocketClient(url, { onStatusChange: count });
 * ```
 *
 * Counts `blue.socket.client.{connecting,opened,reconnecting,closed}`
 * transitions with a `socket.status` attribute — reconnects are the
 * network-instability signal of interest.
 *
 * @returns An `onStatusChange` observer.
 */
export function countSocketClientStatus(): (status: SocketStatus) => void {
    // Lazy per-status counters: the factory may run before
    // `configureBrowserTelemetry` registers the global MeterProvider, so an
    // eager `createCounter` would capture the NoopMeter and drop every
    // datapoint. Resolve each status's instrument on first observation.
    const NAME: Record<SocketStatus, string> = {
        connecting: 'blue.socket.client.connecting',
        open: 'blue.socket.client.opened',
        reconnecting: 'blue.socket.client.reconnecting',
        closed: 'blue.socket.client.closed',
    };
    const cache = new Map<SocketStatus, Counter>();
    const counter = (status: SocketStatus): void => {
        let instrument = cache.get(status);
        if (instrument === undefined) {
            instrument = metrics.getMeter('@blue/telemetry').createCounter(NAME[status]);
            cache.set(status, instrument);
        }
        instrument.add(1, { 'socket.status': status });
    };
    return (status: SocketStatus): void => {
        counter(status);
    };
}

const ENCODER = new TextEncoder();

/**
 * Payload size in bytes for the outbound byte counter: strings by UTF-8
 * length, `ArrayBuffer`/array-buffer views by `byteLength` (binary frames),
 * anything else JSON-encoded. TextEncoder is the isomorphic byte counter
 * (browser + Node).
 *
 * Binary is checked before the JSON fallback: `JSON.stringify` of an
 * `ArrayBuffer` is `'{}'` (2 bytes) and of a `Uint8Array` is an object of
 * index keys, either of which misreports the frame a binary send puts on
 * the wire.
 *
 * @param payload - The outbound payload.
 * @returns The payload's byte length.
 */
function payloadBytes(payload: unknown): number {
    if (typeof payload === 'string') {
        return ENCODER.encode(payload).length;
    }
    if (payload instanceof ArrayBuffer || ArrayBuffer.isView(payload)) {
        return payload.byteLength;
    }
    return ENCODER.encode(JSON.stringify(payload) ?? '').length;
}
