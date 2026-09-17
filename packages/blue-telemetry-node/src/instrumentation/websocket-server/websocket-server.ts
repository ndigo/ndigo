/**
 * OpenTelemetry instrumentation for WebSocket session lifecycle + fan-out.
 * * @module blue-telemetry-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { SpanKind, metrics, trace } from '@opentelemetry/api';
import type { Attributes, Counter, Span } from '@opentelemetry/api';
import { NodeSocketSessionRegistry } from '@blue/platform-node';
import type { SocketSession } from '@blue/socket';
import type { WebSocket } from 'ws';
import { AbstractBaseInstrumentation } from '@blue/telemetry';

/**
 * Options for {@link WebSocketServerInstrumentation}.
 */
export interface WebSocketServerInstrumentationOptions {
    /**
     * Record the `socket.room` attribute on room fan-out series
     * (`blue.socket.messages.sent` / `.bytes` for
     * {@link NodeSocketSessionRegistry.broadcastTo}).
     *
     * **Off by default.** Room names are arbitrary application strings, so
     * a per-entity room (a user id, a document id, a tenant) mints one
     * metric series per entity — unbounded cardinality from data the
     * application controls. Rooms are not path-scoped either (`broadcastTo`
     * receives the room name alone, and members may span paths), so there is
     * no bounded path dimension to attribute them with: off, room fan-out is
     * counted on the attribute-free series, which stays bounded. The
     * per-`broadcast` `socket.path` series remains the per-destination
     * dimension. Enable only when the room vocabulary is a known, small set —
     * a genuine dimension rather than an entity id.
     */
    roomAttribute?: boolean;
}

/**
 * Instrumentation for {@link NodeSocketSessionRegistry} (AD-21/AD-22):
 *
 * - **Session lifetime**: `register`/`remove` pair into a
 *   `SocketSession.connect` SERVER span (path, duration, close code) —
 *   the socket analog of the SSE stream-lifetime instrumentation.
 * - **Counters**: sessions opened / closed (per path + close code),
 *   fan-out messages + bytes (per path; per room only with
 *   {@link WebSocketServerInstrumentationOptions.roomAttribute}),
 *   backpressure closes (close code `1013`).
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
    /**
     * Whether room fan-out series carry the `socket.room` attribute (see
     * {@link WebSocketServerInstrumentationOptions.roomAttribute}).
     *
     * Read lazily inside the wrapped `broadcastTo`, never in `enable()`:
     * `InstrumentationBase` runs `enable()` from its own constructor —
     * which builds the wrappers — before this subclass's field
     * initializers and constructor body run.
     */
    readonly #roomAttribute: boolean;

    /**
     * @param options - Room-attribute opt-in (see
     *   {@link WebSocketServerInstrumentationOptions}).
     */
    constructor(options: WebSocketServerInstrumentationOptions = {}) {
        super('websocket-server');
        this.#roomAttribute = options.roomAttribute ?? false;
    }

    enable(): void {
        // `InstrumentationBase` calls `enable()` from ITS constructor —
        // before this subclass's field initializers (or any `#private`
        // member) exist. State therefore lives in module-level WeakMaps
        // keyed by instance, and the latch below makes the second enable
        // (SDK `registerInstrumentations`) a no-op.
        if (ENABLED.has(this)) {
            return;
        }
        ENABLED.add(this);
        // Captured for the room-gating observer: `#roomAttribute` is assigned
        // in the constructor body, which runs *after* this `enable()` (the
        // base constructor calls it), so the observer reads it lazily at
        // call time through this getter rather than closing over a value
        // that does not exist yet.
        const roomAttribute = (): boolean => this.#roomAttribute;
        const open = OPEN_SPANS.get(this) ?? new Map<SocketSession, OpenSession>();
        OPEN_SPANS.set(this, open);
        const overflowObservers = OVERFLOW_UNSUBS.get(this) ?? [];
        OVERFLOW_UNSUBS.set(this, overflowObservers);
        const fanoutObservers = FANOUT_UNSUBS.get(this) ?? [];
        FANOUT_UNSUBS.set(this, fanoutObservers);

        // Counters are resolved lazily on first use, not at `enable()` time:
        // the constructor-time enable precedes any SDK MeterProvider
        // registration — an eager `metrics.getMeter(...).createCounter(...)`
        // would capture the NoopMeter and silently drop every datapoint. The
        // first wrapped call runs after SDK init, so the global meter is real
        // by then. (Tracers need no such care: the API's ProxyTracerProvider
        // defers to the registered provider.)
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
        const tracer = trace.getTracer('@blue/telemetry');

        // Backpressure decisions: the registry's onOverflow observer is the
        // only seam that sees drop-mode actions (no close event) and the
        // buffered bytes at the decision point. Attach once per registry
        // instance, on first registration crossing the wrapped `register`.
        // (Closed over via module-level sets — inside the patch the receiver
        // `this` is the registry instance.)
        const observedRegistries = OBSERVED_REGISTRIES.get(this) ?? new WeakSet<NodeSocketSessionRegistry>();
        OBSERVED_REGISTRIES.set(this, observedRegistries);
        this._wrap(NodeSocketSessionRegistry.prototype, 'register', (original) => {
            return function (this: unknown, session: SocketSession, path: string, transport: WebSocket): void {
                // The registry is idempotent — count only real first-time
                // registrations so opened/closed stay 1:1 with sessions.
                if (!open.has(session)) {
                    counter('blue.socket.sessions.opened', { 'socket.path': path });
                    open.set(session, {
                        span: tracer.startSpan('SocketSession.connect', {
                            kind: SpanKind.SERVER,
                            attributes: { 'socket.path': path } as Attributes,
                        }),
                        began: Date.now(),
                        path,
                    });
                }
                const registry = this as NodeSocketSessionRegistry;
                if (!observedRegistries.has(registry)) {
                    observedRegistries.add(registry);
                    const overflowUnsubscribe = registry.addOverflowObserver((event) => {
                        counter('blue.socket.backpressure.overflow', {
                            'socket.path': event.path,
                            'socket.action': event.action,
                        });
                    });
                    overflowObservers.push(overflowUnsubscribe);
                    // Fan-out metrics ride the registry's serialized-payload
                    // event: the payload is measured where it is serialized
                    // for the wire, so the instrumentation never
                    // re-serializes it (that was a second JSON.stringify per
                    // broadcast). `room` is an arbitrary application string,
                    // so the room dimension is opt-in (TEL-3); off, room
                    // fan-out lands on the bounded attribute-free series.
                    const fanoutUnsubscribe = registry.addFanoutObserver((event) => {
                        const attributes: Attributes | undefined =
                            event.scope === 'path'
                                ? { 'socket.path': event.key }
                                : roomAttribute()
                                  ? { 'socket.room': event.key }
                                  : undefined;
                        counter('blue.socket.messages.sent', attributes);
                        counter('blue.socket.messages.bytes', attributes, event.bytes);
                    });
                    fanoutObservers.push(fanoutUnsubscribe);
                }
                return original.apply(this, [session, path, transport]);
            };
        });

        this._wrap(NodeSocketSessionRegistry.prototype, 'remove', (original) => {
            return function (this: unknown, session: SocketSession, closeCode?: number): void {
                // Count only real removals — a remove of an untracked session
                // is a no-op in the registry and must not drift the counter.
                const entry = open.get(session);
                if (entry !== undefined) {
                    const path = entry.path;
                    counter('blue.socket.sessions.closed', {
                        'socket.path': path,
                        'socket.close_code': closeCode ?? -1,
                    });
                    entry.span.setAttribute('socket.close_code', closeCode ?? -1);
                    entry.span.setAttribute('socket.duration_ms', Date.now() - entry.began);
                    entry.span.end();
                    open.delete(session);
                }
                return original.apply(this, [session, closeCode]);
            };
        });
    }

    disable(): void {
        ENABLED.delete(this);
        this._unwrap(NodeSocketSessionRegistry.prototype, 'register');
        this._unwrap(NodeSocketSessionRegistry.prototype, 'remove');
        // End spans still open (sessions that never hit `remove` while
        // enabled) so disable leaves no dangling spans.
        const now = Date.now();
        for (const entry of OPEN_SPANS.get(this)?.values() ?? []) {
            entry.span.setAttribute('socket.close_code', -1);
            entry.span.setAttribute('socket.duration_ms', now - entry.began);
            entry.span.end();
        }
        OPEN_SPANS.delete(this);
        for (const unsubscribe of OVERFLOW_UNSUBS.get(this) ?? []) {
            unsubscribe();
        }
        OVERFLOW_UNSUBS.delete(this);
        for (const unsubscribe of FANOUT_UNSUBS.get(this) ?? []) {
            unsubscribe();
        }
        FANOUT_UNSUBS.delete(this);
        OBSERVED_REGISTRIES.delete(this);
    }
}

/**
 * Per-instance instrumentation state. Module-level (not `#private` fields):
 * `InstrumentationBase` runs `enable()` from its constructor, before
 * subclass field initializers — and therefore any private member — exist.
 * Keyed by the instrumentation instance so multiple instances (or
 * enable/disable cycles) never share state.
 */
const ENABLED = new WeakSet<WebSocketServerInstrumentation>();
type OpenSession = { span: Span; began: number; path: string };
const OPEN_SPANS = new WeakMap<WebSocketServerInstrumentation, Map<SocketSession, OpenSession>>();
const OBSERVED_REGISTRIES = new WeakMap<WebSocketServerInstrumentation, WeakSet<NodeSocketSessionRegistry>>();
const OVERFLOW_UNSUBS = new WeakMap<WebSocketServerInstrumentation, Array<() => void>>();
const FANOUT_UNSUBS = new WeakMap<WebSocketServerInstrumentation, Array<() => void>>();
