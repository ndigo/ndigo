/**
 * Per-feature metric aggregation and snapshot projection.
 */
import { compareBy, IllegalStateError, numberComparator, stringComparator, Deque } from '@ndigo/core';
import { type MetricSnapshot, type MetricSnapshotProvider } from './metric-snapshot';

interface MutableFeatureMetrics {
    counters: Map<string, number>;
    durations: Map<string, Deque<number>>;
    gauges: Map<string, number>;
    updatedAt: Date;
}

/**
 * Represents a statistical summary of recorded durations.
 */
export interface DurationSummary {
    /** Number of retained samples. */
    readonly count: number;
    /** Largest sample. */
    readonly max: number;
    /** Arithmetic mean. */
    readonly mean: number;
    /** Smallest sample. */
    readonly min: number;
    /** Median sample. */
    readonly p50: number;
}

/**
 * Represents a collection of metrics for a specific feature.
 */
export interface FeatureMetrics {
    /** Counter totals by name. */
    readonly counters: ReadonlyMap<string, number>;
    /** Duration summaries by name. */
    readonly durations: ReadonlyMap<string, DurationSummary>;
    /** The feature name. */
    readonly feature: string;
    /** Gauge values by name. */
    readonly gauges: ReadonlyMap<string, number>;
    /** Last update time. */
    readonly updatedAt: Date;
}

/**
 * Options for configuring the `FeatureMetricAggregator`.
 */
export interface FeatureMetricAggregatorOptions {
    /** Maximum retained duration samples per series. */
    readonly maxDurationSamples?: number;
    /** Maximum tracked features. */
    readonly maxFeatures?: number;
}

/**
 * Aggregates and manages various metrics (counters, gauges, durations) for different features.
 *
 * This class provides methods to increment counters, set gauge values, and record durations,
 * organizing them by feature. It also offers a way to retrieve summarized metrics for analysis.
 */
export class FeatureMetricAggregator {
    #featureMetricsMap: Map<string, MutableFeatureMetrics>;
    #maxDurationSamples: number;
    #maxFeatures: number;

    /**
     * Creates an instance of `FeatureMetricAggregator`.
     * @param options - Configuration options for the aggregator.
     */
    constructor(options: FeatureMetricAggregatorOptions = {}) {
        this.#featureMetricsMap = new Map();
        this.#maxDurationSamples = options.maxDurationSamples ?? 1000;
        this.#maxFeatures = options.maxFeatures ?? 100;
    }

    /**
     * Returns a read-only array of all feature names currently being tracked by the aggregator.
     */
    get featureNames(): readonly string[] {
        return Object.freeze(Array.from(this.#featureMetricsMap.keys()));
    }

    /**
     * Clears all aggregated metrics for all features.
     */
    clear(): void {
        this.#featureMetricsMap.clear();
    }

    /**
     * Clears all aggregated metrics for a specific feature.
     * @param feature - The name of the feature to clear.
     * @returns `true` if the feature was found and cleared, `false` otherwise.
     */
    clearFeature(feature: string): boolean {
        return this.#featureMetricsMap.delete(feature);
    }

    /**
     * Retrieves a read-only snapshot of all metrics for a given feature.
     * Durations are summarized into `DurationSummary` objects.
     * @param feature - The name of the feature to retrieve metrics for.
     * @returns A `FeatureMetrics` object if the feature exists, otherwise `undefined`.
     */
    getFeatureMetrics(feature: string): FeatureMetrics | undefined {
        const metrics = this.#featureMetricsMap.get(feature);

        if (!metrics) {
            return undefined;
        }

        return {
            counters: new Map(metrics.counters),
            durations: this.#summarizeDurations(metrics.durations),
            feature,
            gauges: new Map(metrics.gauges),
            updatedAt: new Date(metrics.updatedAt),
        };
    }

    /**
     * Increments a counter for a specific feature. If the counter or feature does not exist, they will be created.
     * @param feature - The name of the feature.
     * @param name - The name of the counter.
     * @param value - The amount to increment the counter by. Defaults to 1. Must be a finite number.
     * @returns The new value of the counter.
     * @throws If the value is not a finite number or if the feature limit is reached.
     */
    incrementCounter(feature: string, name: string, value: number = 1): number {
        this.#assertMetricValue(value);

        const metrics = this.#resolveFeatureMetrics(feature);
        const currentValue = metrics.counters.get(name) ?? 0;
        const nextValue = currentValue + value;

        metrics.counters.set(name, nextValue);
        metrics.updatedAt = new Date();

        return nextValue;
    }

    /**
     * Sets the value of a gauge for a specific feature. If the gauge or feature does not exist, they will be created.
     * @param feature - The name of the feature.
     * @param name - The name of the gauge.
     * @param value - The value to set the gauge to. Must be a finite number.
     * @throws If the value is not a finite number or if the feature limit is reached.
     */
    setGauge(feature: string, name: string, value: number): void {
        this.#assertMetricValue(value);

        const metrics = this.#resolveFeatureMetrics(feature);

        metrics.gauges.set(name, value);
        metrics.updatedAt = new Date();
    }

    /**
     * Records a duration in milliseconds for a specific feature.
     * The aggregator maintains a history of samples up to `maxDurationSamples`.
     * @param feature - The name of the feature.
     * @param name - The name of the duration metric.
     * @param durationMs - The duration in milliseconds. Must be a non-negative finite number.
     * @throws If the duration is not a finite number, is negative, or if the feature limit is reached.
     */
    recordDuration(feature: string, name: string, durationMs: number): void {
        this.#assertMetricValue(durationMs);

        if (durationMs < 0) {
            throw new IllegalStateError('Duration must be non-negative');
        }

        const metrics = this.#resolveFeatureMetrics(feature);
        let samples = metrics.durations.get(name);

        if (!samples) {
            samples = new Deque<number>(this.#maxDurationSamples);
            metrics.durations.set(name, samples);
        }

        samples.push(durationMs);

        if (samples.length > this.#maxDurationSamples) {
            samples.shift();
        }

        metrics.updatedAt = new Date();
    }

    #assertMetricValue(value: number): void {
        if (!Number.isFinite(value)) {
            throw new IllegalStateError('Feature metric value must be a finite number');
        }
    }

    #resolveFeatureMetrics(feature: string): MutableFeatureMetrics {
        const existing = this.#featureMetricsMap.get(feature);

        if (existing) {
            return existing;
        }

        if (this.#featureMetricsMap.size >= this.#maxFeatures) {
            throw new IllegalStateError(`Feature metric limit reached (${this.#maxFeatures})`);
        }

        const created: MutableFeatureMetrics = {
            counters: new Map(),
            durations: new Map(),
            gauges: new Map(),
            updatedAt: new Date(),
        };

        this.#featureMetricsMap.set(feature, created);

        return created;
    }

    #summarizeDurations(durationsMap: Map<string, Deque<number>>): ReadonlyMap<string, DurationSummary> {
        const result = new Map<string, DurationSummary>();

        for (const [name, samples] of durationsMap.entries()) {
            if (samples.length === 0) {
                continue;
            }

            const sorted = [...samples].sort(numberComparator.compare);
            const count = sorted.length;
            const min = sorted[0];
            const max = sorted[count - 1];
            const mean = sorted.reduce((sum, v) => sum + v, 0) / count;
            const p50Index = Math.floor(count / 2);
            const p50 = count % 2 === 0 ? (sorted[p50Index - 1] + sorted[p50Index]) / 2 : sorted[p50Index];

            result.set(name, { count, max, mean, min, p50 });
        }

        return result;
    }
}

/**
 * The aggregator as a {@link MetricSnapshotProvider} (REV-003): projects the
 * tracked features into the snapshot model the `/metrics` endpoint serves.
 * Installed by `ManagementAutoConfiguration` as the *fallback* snapshot
 * source, so feature counters are served even when no telemetry pipeline
 * (pull reader) is configured — a registered current provider always wins.
 *
 * Projection rules:
 * - counters → `sum` snapshots, gauges → `gauge` snapshots, both named
 *   `{feature}.{metric}` with empty attributes;
 * - durations → `histogram` snapshots (count/sum/min/max, no buckets — the
 *   raw samples are summarized, not bucketed), so the Prometheus view
 *   projects the `_count` counter + `_sum` gauge pair;
 * - name collisions within one snapshot (same feature + metric name across
 *   two kinds) keep the first entry — the wire views key by name, so a
 *   duplicate would clobber in the JSON view.
 */
export class FeatureMetricAggregatorProvider implements MetricSnapshotProvider {
    readonly #aggregator: FeatureMetricAggregator;

    /**
     * Creates the provider over an aggregator.
     *
     * @param aggregator - The aggregator to project (bound by the caller).
     */
    constructor(aggregator: FeatureMetricAggregator) {
        this.#aggregator = aggregator;
    }

    /**
     * Projects every tracked feature into snapshot form.
     *
     * @returns The snapshots, feature-sorted.
     */
    async snapshot(): Promise<readonly MetricSnapshot[]> {
        const snapshots: MetricSnapshot[] = [];
        const names = new Set<string>();

        for (const feature of [...this.#aggregator.featureNames].sort()) {
            const metrics = this.#aggregator.getFeatureMetrics(feature);
            if (!metrics) continue;

            const push = (
                name: string,
                type: 'sum' | 'gauge' | 'histogram',
                value: MetricSnapshot['points'][number]['value']
            ): void => {
                if (names.has(name)) return; // first wins — see the module docs
                names.add(name);
                snapshots.push({
                    name,
                    description: '',
                    unit: '',
                    type,
                    points: [{ attributes: {}, value }],
                });
            };

            const gauges = [...metrics.gauges.entries()].sort(compareBy(([key]) => key, stringComparator.compare));
            for (const [name, value] of gauges) {
                push(`${feature}.${name}`, 'gauge', { kind: 'scalar', value });
            }
            const counters = [...metrics.counters.entries()].sort(compareBy(([key]) => key, stringComparator.compare));
            for (const [name, value] of counters) {
                push(`${feature}.${name}`, 'sum', { kind: 'scalar', value });
            }
            const durations = [...metrics.durations.entries()].sort(
                compareBy(([key]) => key, stringComparator.compare)
            );
            for (const [name, summary] of durations) {
                push(`${feature}.${name}`, 'histogram', {
                    kind: 'histogram',
                    count: summary.count,
                    sum: summary.mean * summary.count,
                    min: summary.min,
                    max: summary.max,
                    buckets: [],
                });
            }
        }

        return snapshots;
    }
}
