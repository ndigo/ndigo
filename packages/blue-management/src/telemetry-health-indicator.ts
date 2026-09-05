/**
 * @author Jeff Rose
 */

import { FeatureMetricAggregator } from '@blue/telemetry';
import { HealthIndicator, HealthResult, HealthState } from './health';

/**
 * A {@link HealthIndicator} reporting the health of the telemetry/metrics
 * pipeline.
 *
 * Reports `UP` when a {@link FeatureMetricAggregator} is present (metrics are
 * being collected); details include the number of features tracked. Reports
 * `DOWN` when none is wired (management endpoints would serve empty metrics).
 *
 * @since 1.0.0
 */
export class TelemetryHealthIndicator implements HealthIndicator {
    readonly name = 'telemetry';
    #aggregator: FeatureMetricAggregator | undefined;

    /**
     * @param aggregator - The shared feature-metric aggregator (may be
     *   `undefined` when the app has not wired one — reported `DOWN`).
     */
    constructor(aggregator: FeatureMetricAggregator | undefined) {
        this.#aggregator = aggregator;
    }

    /** @inheritdoc */
    check(): HealthResult {
        const status: HealthState = this.#aggregator ? 'UP' : 'DOWN';
        const details = this.#aggregator
            ? { features: this.#aggregator.featureNames.length }
            : { reason: 'No FeatureMetricAggregator wired' };
        return { status, details };
    }
}
