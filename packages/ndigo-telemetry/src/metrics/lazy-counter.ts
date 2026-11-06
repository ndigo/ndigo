/**
 * Shared lazily-resolved instrument seam.
 *
 * Instrumentation wrappers and decorators are built at class/module load —
 * often before any SDK registers a global `MeterProvider` — so an eager
 * `metrics.getMeter(...).createCounter(...)` would capture the NoopMeter and
 * silently drop every datapoint. These factories defer instrument creation to
 * the first recorded call (post-SDK-init) and cache it per metric name.
 */
import { metrics } from '@opentelemetry/api';
import type { Attributes, Counter, Histogram } from '@opentelemetry/api';

/**
 * A counter handle keyed by metric name: creates the instrument on first use
 * and records `value` (default `1`) against it thereafter.
 */
export type LazyCounter = (name: string, attributes?: Attributes, value?: number) => void;

/**
 * A histogram handle keyed by metric name: creates the instrument on first
 * use and records `value` (default `1`) against it thereafter.
 */
export type LazyHistogram = (name: string, attributes?: Attributes, value?: number) => void;

/**
 * Options for {@link createLazyHistogram} — applied to every instrument the
 * returned handle creates.
 */
export interface LazyHistogramOptions {
    /**
     * The unit of the recorded values (semconv units, e.g. `s`).
     */
    unit?: string;
    /**
     * The metric description (semconv description text).
     */
    description?: string;
    /**
     * Explicit bucket boundaries in the value's unit, honored by the SDK's
     * default aggregation for `HISTOGRAM` instruments.
     */
    boundaries?: readonly number[];
}

/**
 * Builds a lazy instrument handle: each recorded name resolves the named
 * instrument against the *current* global meter the first time that name is
 * seen — the meter provider registered by the time the first datapoint is
 * recorded.
 *
 * @param create - Creates the instrument for a metric name.
 * @param record - Records a value against the instrument (counters `add`,
 *   histograms `record`).
 * @returns A handle that records against lazily resolved instruments.
 */
function createLazyInstrument<T>(
    create: (name: string) => T,
    record: (instrument: T, value: number, attributes?: Attributes) => void
): (name: string, attributes?: Attributes, value?: number) => void {
    const cache = new Map<string, T>();

    return (name: string, attributes?: Attributes, value: number = 1): void => {
        let instrument = cache.get(name);
        if (instrument === undefined) {
            instrument = create(name);
            cache.set(name, instrument);
        }
        record(instrument, value, attributes);
    };
}

/**
 * Creates a {@link LazyCounter}. Each call resolves the named instrument
 * against the *current* global meter the first time that name is seen — the
 * meter provider registered by the time the first datapoint is recorded.
 *
 * @returns A counter handle that resolves instruments lazily.
 */
export function createLazyCounter(): LazyCounter {
    return createLazyInstrument<Counter>(
        (name: string): Counter => metrics.getMeter('@ndigo/telemetry').createCounter(name),
        (instrument: Counter, value: number, attributes?: Attributes): void => {
            instrument.add(value, attributes);
        }
    );
}

/**
 * Creates a {@link LazyHistogram} with per-instrument options: the semconv
 * unit/description and the advice bucket boundaries applied to every
 * instrument the handle creates. The SDK's default aggregation turns
 * `HISTOGRAM` instruments with `advice.explicitBucketBoundaries` into an
 * explicit-bucket histogram — the aggregation the Prometheus exporter and
 * the `/metrics` histogram projection consume.
 *
 * @param options - The instrument options applied per created histogram.
 * @returns A histogram handle that resolves instruments lazily.
 */
export function createLazyHistogram(options: LazyHistogramOptions = {}): LazyHistogram {
    const unit = options.unit;
    const description = options.description;
    const boundaries = options.boundaries;

    return createLazyInstrument<Histogram>(
        (name: string): Histogram =>
            metrics.getMeter('@ndigo/telemetry').createHistogram(name, {
                ...(unit === undefined ? {} : { unit }),
                ...(description === undefined ? {} : { description }),
                ...(boundaries === undefined ? {} : { advice: { explicitBucketBoundaries: [...boundaries] } }),
            }),
        (instrument: Histogram, value: number, attributes?: Attributes): void => {
            instrument.record(value, attributes);
        }
    );
}
