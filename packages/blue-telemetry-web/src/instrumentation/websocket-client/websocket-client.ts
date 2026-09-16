/**
 * OpenTelemetry instrumentation for the `@blue/socket` client.
 * * @module blue-telemetry-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { metrics } from '@opentelemetry/api';
import type { Attributes, Counter } from '@opentelemetry/api';
import { WebSocketClient, type SocketStatus } from '@blue/socket';
import { AbstractBaseInstrumentation } from '@blue/telemetry';

/**
 * Instrumentation for {@link WebSocketClient} (AD-22): outbound message
 * and byte counters + deliberate-close counters, via prototype patches.
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
                // Deliberate-close OPERATIONS — distinct from
                // `blue.socket.client.closed` (the STATUS transition counter
                // `countSocketClientStatus` increments), so wiring both seams
                // doesn't double-count a single close.
                counter('blue.socket.client.closes', { 'socket.close_code': code ?? 1000 });
                return original.apply(this, [code, reason]);
            };
        });
    }

    disable(): void {
        this._unwrap(WebSocketClient.prototype, 'send');
        this._unwrap(WebSocketClient.prototype, 'close');
    }
}

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
 * Wire size of the payload as transmitted (strings as text frames,
 * anything else JSON-encoded — `SocketClient.send` parity). TextEncoder is
 * the isomorphic byte counter (browser + Node).
 *
 * @param payload - The outbound payload.
 * @returns The UTF-8 byte length.
 */
function payloadBytes(payload: unknown): number {
    const wire = typeof payload === 'string' ? payload : (JSON.stringify(payload) ?? '');
    return ENCODER.encode(wire).length;
}