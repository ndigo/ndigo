import { IllegalStateError } from '@blue/core';
import { FeatureMetricAggregator } from './feature-metric-aggregator';

export interface CounterRateSnapshot {
    readonly counterKey: string;
    readonly feature: string;
    readonly ratePerSecond: number;
}

export interface CounterRateAlert {
    readonly counterKey: string;
    readonly feature: string;
    readonly ratePerSecond: number;
    readonly threshold: number;
}

export interface CounterRateResolverOptions {
    readonly aggregator: FeatureMetricAggregator;
    readonly thresholds?: ReadonlyMap<string, number>;
    readonly windowSize?: number;
}

export class CounterRateResolver {
    #aggregator: FeatureMetricAggregator;
    #sampleHistory: Array<{ timestamp: number; values: Map<string, number> }>;
    #thresholdByCounterKey: Map<string, number>;
    #windowSize: number;

    constructor(options: CounterRateResolverOptions) {
        this.#aggregator = options.aggregator;
        this.#sampleHistory = [];
        this.#thresholdByCounterKey = new Map(options.thresholds);
        this.#windowSize = options.windowSize ?? 1;
    }

    clearThresholds(): void {
        this.#thresholdByCounterKey.clear();
    }

    removeThreshold(counterKey: string): boolean {
        return this.#thresholdByCounterKey.delete(counterKey);
    }

    reset(): void {
        this.#sampleHistory = [];
    }

    resolve(): readonly CounterRateSnapshot[] {
        const now = Date.now();
        const currentValues = new Map<string, number>();

        for (const feature of this.#aggregator.featureNames) {
            const featureMetrics = this.#aggregator.getFeatureMetrics(feature);

            if (!featureMetrics) {
                continue;
            }

            for (const [counterKey, value] of featureMetrics.counters.entries()) {
                currentValues.set(this.#toStorageKey(feature, counterKey), value);
            }
        }

        this.#sampleHistory.push({ timestamp: now, values: currentValues });

        if (this.#sampleHistory.length > this.#windowSize + 1) {
            this.#sampleHistory.shift();
        }

        const snapshots: CounterRateSnapshot[] = [];

        if (this.#sampleHistory.length < 2) {
            for (const feature of this.#aggregator.featureNames) {
                const featureMetrics = this.#aggregator.getFeatureMetrics(feature);

                if (!featureMetrics) {
                    continue;
                }

                for (const counterKey of featureMetrics.counters.keys()) {
                    snapshots.push({
                        counterKey,
                        feature,
                        ratePerSecond: 0,
                    });
                }
            }

            return snapshots;
        }

        const oldestSample = this.#sampleHistory[0];
        const currentSample = this.#sampleHistory[this.#sampleHistory.length - 1];
        const elapsedMilliseconds = currentSample.timestamp - oldestSample.timestamp;
        const elapsedSeconds = elapsedMilliseconds > 0 ? elapsedMilliseconds / 1000 : 0;

        for (const feature of this.#aggregator.featureNames) {
            const featureMetrics = this.#aggregator.getFeatureMetrics(feature);

            if (!featureMetrics) {
                continue;
            }

            for (const counterKey of featureMetrics.counters.keys()) {
                const storageKey = this.#toStorageKey(feature, counterKey);
                const currentValue = currentSample.values.get(storageKey) ?? 0;
                const oldestValue = oldestSample.values.get(storageKey) ?? currentValue;
                const ratePerSecond = elapsedSeconds > 0 ? (currentValue - oldestValue) / elapsedSeconds : 0;

                snapshots.push({
                    counterKey,
                    feature,
                    ratePerSecond,
                });
            }
        }

        return snapshots;
    }

    resolveAlerts(snapshots: readonly CounterRateSnapshot[] = this.resolve()): readonly CounterRateAlert[] {
        return snapshots
            .map((snapshot) => {
                const threshold = this.#thresholdByCounterKey.get(snapshot.counterKey);

                if (threshold === undefined || snapshot.ratePerSecond <= threshold) {
                    return undefined;
                }

                return {
                    counterKey: snapshot.counterKey,
                    feature: snapshot.feature,
                    ratePerSecond: snapshot.ratePerSecond,
                    threshold,
                };
            })
            .filter((alert): alert is CounterRateAlert => Boolean(alert));
    }

    setThreshold(counterKey: string, threshold: number): void {
        if (!Number.isFinite(threshold)) {
            throw new IllegalStateError('Counter rate threshold must be a finite number');
        }

        this.#thresholdByCounterKey.set(counterKey, threshold);
    }

    #toStorageKey(feature: string, counterKey: string): string {
        return `${feature}::${counterKey}`;
    }
}
