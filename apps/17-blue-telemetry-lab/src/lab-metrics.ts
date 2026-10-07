/**
 * The lab's counter/gauge surface, and the bridge between the two metric
 * views the demo contrasts:
 *
 * - **pull** — every observation is mirrored into the context-level
 *   `FeatureMetricAggregator` (AD-32), which is what `GET /metrics`
 *   serializes (`@blue/management`).
 * - **push** — the instrumented methods carry `@counted` (see
 *   {@link WorkService}/{@link LabTicker}), which records an OpenTelemetry
 *   counter that the configured metric exporter ships to the collector.
 *
 * The class keeps its own tallies too, so `/lab/state` reports the same
 * numbers even when no aggregator is wired (direct instantiation in tests).
 *
 * @module blue-telemetry-lab
 * @since 1.0.0
 * @author Jeff Rose
 */
import { $aware } from '@blue/factory';
import type { ApplicationContext, ApplicationContextAware } from '@blue/context';
import { METRIC_AGGREGATOR } from '@blue/management';
import type { DurationSummary, FeatureMetricAggregator } from '@blue/telemetry';

/** The `/metrics` feature name every lab counter is filed under. */
export const LAB_FEATURE = 'telemetry-lab';

/**
 * The lab's own metrics snapshot — the shape `GET /lab/state` returns.
 */
export interface LabMetricsSnapshot {
    /** Cumulative counters, by name. */
    readonly counters: Record<string, number>;
    /** Last-write-wins gauges, by name. */
    readonly gauges: Record<string, number>;
    /** Duration summaries (from the aggregator's sample history), by name. */
    readonly durations: Record<string, DurationSummary>;
    /** When the last observation landed. */
    readonly updatedAt: string;
}

/**
 * Records the lab's observations into its own tallies and, when available,
 * into the shared {@link FeatureMetricAggregator} the management endpoints
 * read.
 */
export class LabMetrics implements ApplicationContextAware {
    readonly #counters = new Map<string, number>();
    readonly #gauges = new Map<string, number>();
    #aggregator: FeatureMetricAggregator | null;
    #context: ApplicationContext | null = null;
    #updatedAt = new Date(0);

    /**
     * @param aggregator - Optional aggregator wired at construction (the seam
     *   tests use); otherwise the context bean is resolved lazily on first use.
     */
    constructor(aggregator: FeatureMetricAggregator | null = null) {
        this.#aggregator = aggregator;
    }

    /**
     * Marks the value as `Aware` for the factory's aware injection, so
     * `setApplicationContext` runs when this entry is registered.
     */
    get [$aware](): boolean {
        return true;
    }

    /**
     * Injects the owning application context (the lazy `METRIC_AGGREGATOR`
     * lookup path).
     *
     * @param context - The application context that owns this bean.
     */
    setApplicationContext(context: ApplicationContext): void {
        this.#context = context;
    }

    /**
     * The context-level aggregator, resolved on first use: the management
     * bean is created during refresh, after this bean's constructor ran.
     *
     * @returns The shared aggregator, or `null` when none is wired.
     */
    #aggregatorRef(): FeatureMetricAggregator | null {
        if (this.#aggregator) {
            return this.#aggregator;
        }
        if (this.#context?.hasValue?.(METRIC_AGGREGATOR)) {
            this.#aggregator = this.#context.getValue<FeatureMetricAggregator>(METRIC_AGGREGATOR);
        }
        return this.#aggregator;
    }

    /**
     * Increments a counter in both views (local tally + `/metrics` feature).
     *
     * @param name - The counter name.
     * @param value - The amount to add. Defaults to `1`.
     * @returns The new cumulative value.
     */
    increment(name: string, value = 1): number {
        const next = (this.#counters.get(name) ?? 0) + value;
        this.#counters.set(name, next);
        this.#updatedAt = new Date();
        this.#aggregatorRef()?.incrementCounter(LAB_FEATURE, name, value);
        return next;
    }

    /**
     * Sets a gauge value in both views.
     *
     * @param name - The gauge name.
     * @param value - The value to set.
     */
    setGauge(name: string, value: number): void {
        this.#gauges.set(name, value);
        this.#updatedAt = new Date();
        this.#aggregatorRef()?.setGauge(LAB_FEATURE, name, value);
    }

    /**
     * Records a duration sample (aggregator history; `/metrics` exposes the
     * summary, `/lab/state` mirrors it).
     *
     * @param name - The duration metric name.
     * @param durationMs - The observed duration in milliseconds.
     */
    recordDuration(name: string, durationMs: number): void {
        this.#updatedAt = new Date();
        this.#aggregatorRef()?.recordDuration(LAB_FEATURE, name, durationMs);
    }

    /**
     * The current cumulative value of a counter (`0` when unobserved).
     *
     * @param name - The counter name.
     * @returns The cumulative value.
     */
    counter(name: string): number {
        return this.#counters.get(name) ?? 0;
    }

    /**
     * A plain-object snapshot of every observed metric. Counters and gauges
     * come from this bean's tallies (always current); duration summaries come
     * from the aggregator's sample history.
     *
     * @returns The snapshot the lab routes serialize.
     */
    snapshot(): LabMetricsSnapshot {
        const metrics = this.#aggregatorRef()?.getFeatureMetrics(LAB_FEATURE);
        return {
            counters: Object.fromEntries(this.#counters),
            gauges: Object.fromEntries(this.#gauges),
            durations: metrics ? Object.fromEntries(metrics.durations) : {},
            updatedAt: this.#updatedAt.toISOString(),
        };
    }
}
