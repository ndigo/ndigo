import { IllegalStateError } from '@blue/core';

interface MutableFeatureMetrics {
    counters: Map<string, number>;
    durations: Map<string, number[]>;
    gauges: Map<string, number>;
    updatedAt: Date;
}

export interface DurationSummary {
    readonly count: number;
    readonly max: number;
    readonly mean: number;
    readonly min: number;
    readonly p50: number;
}

export interface FeatureMetrics {
    readonly counters: ReadonlyMap<string, number>;
    readonly durations: ReadonlyMap<string, DurationSummary>;
    readonly feature: string;
    readonly gauges: ReadonlyMap<string, number>;
    readonly updatedAt: Date;
}

export interface FeatureMetricAggregatorOptions {
    readonly maxDurationSamples?: number;
    readonly maxFeatures?: number;
}

export class FeatureMetricAggregator {
    #featureMetricsMap: Map<string, MutableFeatureMetrics>;
    #maxDurationSamples: number;
    #maxFeatures: number;

    constructor(options: FeatureMetricAggregatorOptions = {}) {
        this.#featureMetricsMap = new Map();
        this.#maxDurationSamples = options.maxDurationSamples ?? 1000;
        this.#maxFeatures = options.maxFeatures ?? 100;
    }

    get featureNames(): readonly string[] {
        return Object.freeze(Array.from(this.#featureMetricsMap.keys()));
    }

    clear(): void {
        this.#featureMetricsMap.clear();
    }

    clearFeature(feature: string): boolean {
        return this.#featureMetricsMap.delete(feature);
    }

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

    incrementCounter(feature: string, name: string, value: number = 1): number {
        this.#assertMetricValue(value);

        const metrics = this.#resolveFeatureMetrics(feature);
        const currentValue = metrics.counters.get(name) ?? 0;
        const nextValue = currentValue + value;

        metrics.counters.set(name, nextValue);
        metrics.updatedAt = new Date();

        return nextValue;
    }

    setGauge(feature: string, name: string, value: number): void {
        this.#assertMetricValue(value);

        const metrics = this.#resolveFeatureMetrics(feature);

        metrics.gauges.set(name, value);
        metrics.updatedAt = new Date();
    }

    recordDuration(feature: string, name: string, durationMs: number): void {
        this.#assertMetricValue(durationMs);

        if (durationMs < 0) {
            throw new IllegalStateError('Duration must be non-negative');
        }

        const metrics = this.#resolveFeatureMetrics(feature);
        let samples = metrics.durations.get(name);

        if (!samples) {
            samples = [];
            metrics.durations.set(name, samples);
        }

        samples.push(durationMs);

        if (samples.length > this.#maxDurationSamples) {
            samples.splice(0, samples.length - this.#maxDurationSamples);
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

    #summarizeDurations(durationsMap: Map<string, number[]>): ReadonlyMap<string, DurationSummary> {
        const result = new Map<string, DurationSummary>();

        for (const [name, samples] of durationsMap.entries()) {
            if (samples.length === 0) {
                continue;
            }

            const sorted = [...samples].sort((a, b) => a - b);
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
