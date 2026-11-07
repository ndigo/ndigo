/**
 * Health indicator for the telemetry/metrics pipeline.
 */
import { FeatureMetricAggregator } from '@ndigo/telemetry';
import { HealthIndicator, HealthResult, HealthState } from './health';

/**
 * A {@link HealthIndicator} reporting the health of the telemetry/metrics
 * pipeline.
 *
 * Reports `UP` when a {@link FeatureMetricAggregator} is present (metrics are
 * being collected); details include the number of features tracked. Reports
 * `DOWN` when none is wired (management endpoints would serve empty metrics).
 */
export class TelemetryHealthIndicator implements HealthIndicator {
    /** The indicator name reported under `/health`. */
    readonly name = 'telemetry';
    #aggregator: FeatureMetricAggregator | undefined;

    /**
     * @param aggregator - The shared feature-metric aggregator (may be
     *   `undefined` when the app has not wired one — reported `DOWN`).
     */
    constructor(aggregator: FeatureMetricAggregator | undefined) {
        this.#aggregator = aggregator;
    }

    /**
     * Reports `UP` when a metric aggregator is wired, `DOWN` otherwise.
     *
     * @returns The health result and feature-count details.
     */
    check(): HealthResult {
        const status: HealthState = this.#aggregator ? 'UP' : 'DOWN';
        const details = this.#aggregator
            ? { features: this.#aggregator.featureNames.length }
            : { reason: 'No FeatureMetricAggregator wired' };
        return { status, details };
    }
}
