/**
 * OpenTelemetry instrumentation for WebSocket session lifecycle + fan-out.
 * * @module blue-telemetry-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { SpanKind, metrics, trace } from '@opentelemetry/api';
import type { Attributes, Span } from '@opentelemetry/api';
import { NodeSocketSessionRegistry } from '@blue/platform-node';
import type { SocketSession } from '@blue/socket';
import type { WebSocket } from 'ws';
import { AbstractBaseInstrumentation } from '@blue/telemetry';

/**
 * Instrumentation for {@link NodeSocketSessionRegistry} (AD-21/AD-22):
 *
 * - **Session lifetime**: `register`/`remove` pair into a
 *   `SocketSession.connect` SERVER span (path, duration, close code) —
 *   the socket analog of the SSE stream-lifetime instrumentation.
 * - **Counters**: sessions opened / closed (per path + close code),
 *   fan-out messages + bytes (per path / room), backpressure closes
 *   (close code `1013`).
 *
 * Backpressure envelope (`close`/`drop`, buffered bytes) also reaches the
 * registry's `onOverflow` observer when applications wire one (drop-mode
 * decisions have no close event and are visible only there).
 *
 * @example
 * ```ts
 * configureTelemetry({
 *   instrumentations: [new WebSocketServerInstrumentation()],
 * });
 * ```
 */
export class WebSocketServerInstrumentation extends AbstractBaseInstrumentation {
    constructor() {
        super('websocket-server');
    }

    enable(): void {
        const meter = metrics.getMeter('@blue/telemetry');
        const tracer = trace.getTracer('@blue/telemetry');
        const sessionsOpened = meter.createCounter('blue.socket.sessions.opened');
        const sessionsClosed = meter.createCounter('blue.socket.sessions.closed');
        const backpressureOverflows = meter.createCounter('blue.socket.backpressure.overflow');
        const messagesSent = meter.createCounter('blue.socket.messages.sent');
        const bytesSent = meter.createCounter('blue.socket.messages.bytes');
        // Open session spans keyed by session object — ended on `remove`.
        const open = new WeakMap<SocketSession, { span: Span; began: number; path: string }>();

        this._wrap(NodeSocketSessionRegistry.prototype, 'register', (original) => {
            return function (this: unknown, session: SocketSession, path: string, transport: WebSocket): void {
                sessionsOpened.add(1, { 'socket.path': path });
                open.set(session, {
                    span: tracer.startSpan('SocketSession.connect', {
                        kind: SpanKind.SERVER,
                        attributes: { 'socket.path': path } as Attributes,
                    }),
                    began: Date.now(),
                    path,
                });
                return original.apply(this, [session, path, transport]);
            };
        });

        this._wrap(NodeSocketSessionRegistry.prototype, 'remove', (original) => {
            return function (this: unknown, session: SocketSession, closeCode?: number): void {
                const entry = open.get(session);
                const path = entry?.path ?? '';
                sessionsClosed.add(1, { 'socket.path': path, 'socket.close_code': closeCode ?? -1 });
                if (closeCode === 1013) {
                    backpressureOverflows.add(1, { 'socket.path': path, 'socket.action': 'close' });
                }
                if (entry !== undefined) {
                    entry.span.setAttribute('socket.close_code', closeCode ?? -1);
                    entry.span.setAttribute('socket.duration_ms', Date.now() - entry.began);
                    entry.span.end();
                    open.delete(session);
                }
                return original.apply(this, [session, closeCode]);
            };
        });

        this._wrap(NodeSocketSessionRegistry.prototype, 'broadcast', (original) => {
            return function (this: unknown, path: string, payload: unknown): void {
                messagesSent.add(1, { 'socket.path': path });
                bytesSent.add(payloadBytes(payload), { 'socket.path': path });
                return original.apply(this, [path, payload]);
            };
        });

        this._wrap(NodeSocketSessionRegistry.prototype, 'broadcastTo', (original) => {
            return function (this: unknown, room: string, payload: unknown): void {
                messagesSent.add(1, { 'socket.room': room });
                bytesSent.add(payloadBytes(payload), { 'socket.room': room });
                return original.apply(this, [room, payload]);
            };
        });
    }

    disable(): void {
        this._unwrap(NodeSocketSessionRegistry.prototype, 'register');
        this._unwrap(NodeSocketSessionRegistry.prototype, 'remove');
        this._unwrap(NodeSocketSessionRegistry.prototype, 'broadcast');
        this._unwrap(NodeSocketSessionRegistry.prototype, 'broadcastTo');
    }
}

/**
 * Wire size of the payload as transmitted (strings as text frames,
 * anything else JSON-encoded — `SocketSession.send` parity).
 *
 * @param payload - The fan-out payload.
 * @returns The byte length.
 */
function payloadBytes(payload: unknown): number {
    const wire = typeof payload === 'string' ? payload : (JSON.stringify(payload) ?? '');
    return Buffer.byteLength(wire);
}
