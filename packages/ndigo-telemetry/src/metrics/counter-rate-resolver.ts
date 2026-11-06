/**
 */
import { IllegalStateError } from '@ndigo/core';
import { FeatureMetricAggregator } from './feature-metric-aggregator';

/**
 * Represents a snapshot of a counter's rate per second for a specific feature.
 */
export interface CounterRateSnapshot {
    readonly counterKey: string;
    readonly feature: string;
    readonly ratePerSecond: number;
}

/**
 * Represents an alert triggered when a counter's rate per second exceeds a defined threshold.
 */
export interface CounterRateAlert {
    readonly counterKey: string;
    readonly feature: string;
    readonly ratePerSecond: number;
    readonly threshold: number;
}

/**
 * Options for configuring the `CounterRateResolver`.
 */
export interface CounterRateResolverOptions {
    readonly aggregator: FeatureMetricAggregator;
    readonly thresholds?: ReadonlyMap<string, number>;
    readonly windowSize?: number;
}

/**
 * Resolves and monitors the rate of change for various counters across different features.
 *
 * This class samples counter values over time and calculates their rates per second.
 * It can also trigger alerts if a counter's rate exceeds a predefined threshold.
 */
export class CounterRateResolver {
    #aggregator: FeatureMetricAggregator;
    #sampleHistory: Array<{ timestamp: number; values: Map<string, number> }>;
    #thresholdByCounterKey: Map<string, number>;
    #windowSize: number;

    /**
     * Creates an instance of `CounterRateResolver`.
     * @param options - Configuration options for the resolver.
     */
    constructor(options: CounterRateResolverOptions) {
        this.#aggregator = options.aggregator;
        this.#sampleHistory = [];
        this.#thresholdByCounterKey = new Map(options.thresholds);
        this.#windowSize = options.windowSize ?? 1;
    }

    /**
     * Clears all previously set thresholds for counter rates.
     */
    clearThresholds(): void {
        this.#thresholdByCounterKey.clear();
    }

    /**
     * Removes a specific threshold for a given counter key.
     * @param counterKey - The key of the counter for which to remove the threshold.
     * @returns `true` if the threshold was removed, `false` otherwise.
     */
    removeThreshold(counterKey: string): boolean {
        return this.#thresholdByCounterKey.delete(counterKey);
    }

    /**
     * Resets the internal sample history, effectively clearing all past counter data.
     */
    reset(): void {
        this.#sampleHistory = [];
    }

    /**
     * Resolves the current counter rates per second for all tracked features and counters.
     *
     * This method takes a new sample of counter values, updates the internal history,
     * and calculates the rate of change based on the configured window size.
     *
     * @returns An array of `CounterRateSnapshot` objects, each representing the current rate
     *          for a specific counter and feature.
     */
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

    /**
     * Resolves and returns any counter rate alerts based on the provided snapshots and configured thresholds.
     * @param snapshots - Optional. An array of `CounterRateSnapshot` objects to evaluate. If not provided,
     *                    `resolve()` will be called to generate the latest snapshots.
     * @returns An array of `CounterRateAlert` objects for any counters whose rates exceed their thresholds.
     */
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

    /**
     * Sets a threshold for a specific counter key. If the counter's rate per second
     * exceeds this threshold, an alert will be triggered by `resolveAlerts`.
     * @param counterKey - The key of the counter to set the threshold for.
     * @param threshold - The rate per second threshold. Must be a finite number.
     * @throws If the threshold is not a finite number.
     */
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
