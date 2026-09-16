/**
 * OpenTelemetry instrumentation for the `@blue/socket` client.
 * * @module blue-telemetry-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { metrics } from '@opentelemetry/api';
import type { Counter } from '@opentelemetry/api';
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
        const meter = metrics.getMeter('@blue/telemetry');
        const messagesSent = meter.createCounter('blue.socket.client.messages.sent');
        const bytesSent = meter.createCounter('blue.socket.client.messages.bytes');
        const closed = meter.createCounter('blue.socket.client.closed');

        this._wrap(WebSocketClient.prototype, 'send', (original) => {
            return function (this: unknown, data: unknown): void {
                messagesSent.add(1);
                bytesSent.add(payloadBytes(data));
                return original.apply(this, [data]);
            };
        });

        this._wrap(WebSocketClient.prototype, 'close', (original) => {
            return function (this: unknown, code?: number, reason?: string): void {
                closed.add(1, { 'socket.close_code': code ?? 1000 });
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
    const meter = metrics.getMeter('@blue/telemetry');
    const counters: Record<SocketStatus, Counter> = {
        connecting: meter.createCounter('blue.socket.client.connecting'),
        open: meter.createCounter('blue.socket.client.opened'),
        reconnecting: meter.createCounter('blue.socket.client.reconnecting'),
        closed: meter.createCounter('blue.socket.client.closed'),
    };
    return (status: SocketStatus): void => {
        counters[status].add(1, { 'socket.status': status });
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