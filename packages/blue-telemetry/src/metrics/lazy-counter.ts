/**
 * Shared lazily-resolved counter seam.
 *
 * Instrumentation wrappers and decorators are built at class/module load —
 * often before any SDK registers a global `MeterProvider` — so an eager
 * `metrics.getMeter(...).createCounter(...)` would capture the NoopMeter and
 * silently drop every datapoint. This factory defers instrument creation to
 * the first recorded call (post-SDK-init) and caches it per metric name.
 *
 * @module blue-telemetry
 * @since 1.0.0
 * @author Jeff Rose
 */
import { metrics } from '@opentelemetry/api';
import type { Attributes, Counter } from '@opentelemetry/api';

/**
 * A counter handle keyed by metric name: creates the instrument on first use
 * and records `value` (default `1`) against it thereafter.
 */
export type LazyCounter = (name: string, attributes?: Attributes, value?: number) => void;

/**
 * Creates a {@link LazyCounter}. Each call resolves the named instrument
 * against the *current* global meter the first time that name is seen — the
 * meter provider registered by the time the first datapoint is recorded.
 *
 * @returns A counter handle that resolves instruments lazily.
 */
export function createLazyCounter(): LazyCounter {
    const cache = new Map<string, Counter>();
    return (name: string, attributes?: Attributes, value: number = 1): void => {
        let instrument = cache.get(name);
        if (instrument === undefined) {
            instrument = metrics.getMeter('@blue/telemetry').createCounter(name);
            cache.set(name, instrument);
        }
        instrument.add(value, attributes);
    };
}
