/**
 * Bridges event occurrences and reactive state (AD-09): `eventsToSignal`
 * feeds a `Signal` from an emitter-shaped source, `signalToEvents`
 * re-emits a `Signal`'s changes as occurrences on an emitter-shaped sink.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Signal, effect } from '@preact/signals-core';

/**
 * An emitter-shaped source of event occurrences. Deliberately structural:
 * any object exposing `on`/`off` — e.g. `@ndigo/context`'s `Emitter` —
 * satisfies it, so `@ndigo/signals` stays free of that dependency.
 */
export interface EventSource {
    on(type: string | symbol, listener: (...args: unknown[]) => void): unknown;

    off(type: string | symbol, listener: (...args: unknown[]) => void): unknown;
}

/** An emitter-shaped sink that event occurrences are written to. */
export interface EventSink {
    emit(type: string | symbol, ...data: unknown[]): unknown;
}

/**
 * Options for the signal↔event bridges: an optional `transform` mapping the
 * source value to the emitted payload (default: the value itself) and
 * `emitInitial` to emit the current value once on subscribe (default `false` — a
 * subscription must not synthesize an occurrence from existing state).
 */
export interface SignalToEventsOptions<T> {
    /** Maps the signal value to the emitted payload. Default: the value itself. */
    transform?: (value: T) => unknown;

    /**
     * Emit the current value once on subscribe. Default: `false` —
     * subscribing must not synthesize an occurrence from existing state.
     */
    emitInitial?: boolean;
}

/**
 * Bridges one event type of an emitter-shaped source into a signal,
 * writing each occurrence's payload (first argument; transform for other
 * shapes) as the signal's value. Occurrences collapse to the latest
 * payload — inherent to signals, which hold state, not histories.
 *
 * @param source - The emitter-shaped source to subscribe to.
 * @param type - The event type whose occurrences are captured.
 * @param target - The signal written with each occurrence's payload.
 * @param transform - Maps each payload to the signal value. Default: identity.
 * @returns A stop function: unsubscribes from the source.
 *
 * @example
 * ```ts
 * const status = signal<'up' | 'down'>('down');
 * const stop = eventsToSignal(context, 'service:status', status, (payload) => payload.status);
 * // views subscribed to `status` reflect the latest service state
 * stop(); // tear down
 * ```
 */
export function eventsToSignal<T>(
    source: EventSource,
    type: string | symbol,
    target: Signal<T>,
    transform: (payload: unknown) => T = (payload) => payload as T
): () => void {
    const listener = (payload: unknown): void => {
        target.value = transform(payload);
    };

    source.on(type, listener);

    return () => {
        source.off(type, listener);
    };
}

/**
 * Bridges a signal's changes into occurrences on an emitter-shaped sink,
 * emitting under the given event type.
 *
 * @param source - The signal whose changes are observed.
 * @param sink - The emitter-shaped sink occurrences are emitted on.
 * @param type - The event type emitted for each change.
 * @param options - Payload shaping and initial-emission control.
 * @returns A stop function: disposes the underlying effect.
 *
 * @example
 * ```ts
 * const stop = signalToEvents(counter, context, 'counter:changed', { transform: (n) => ({ count: n }) });
 * // listeners on 'counter:changed' fire on each change
 * stop(); // tear down
 * ```
 */
export function signalToEvents<T>(
    source: Signal<T>,
    sink: EventSink,
    type: string | symbol,
    options: SignalToEventsOptions<T> = {}
): () => void {
    const { transform = (value) => value, emitInitial = false } = options;
    let first = true;

    // Reads source.value on the effect's first run so the dependency is
    // tracked; only the emission is gated by `emitInitial`.
    const propagate = (): void => {
        const value = source.value;
        if (first) {
            first = false;
            if (!emitInitial) {
                return;
            }
        }
        sink.emit(type, transform(value));
    };

    return effect(propagate);
}
