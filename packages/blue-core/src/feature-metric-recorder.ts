/**
 * Contract for recording feature-level metrics.
 * * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
export interface FeatureMetricRecorder {
    /**
     * Increments a counter metric for a specific feature.
     * @param feature - The name of the feature.
     * @param metricName - The name of the metric to increment.
     * @param value - The amount to increment the counter by. Defaults to 1.
     */
    incrementCounter(feature: string, metricName: string, value?: number): void;
    /**
     * Records a duration metric for a specific feature.
     * @param feature - The name of the feature.
     * @param metricName - The name of the metric to record.
     * @param durationMs - The duration in milliseconds.
     */
    recordDuration?(feature: string, metricName: string, durationMs: number): void;
    /**
     * Sets a gauge metric to a specific value for a feature.
     * @param feature - The name of the feature.
     * @param metricName - The name of the metric to set.
     * @param value - The value to set the gauge to.
     */
    setGauge?(feature: string, metricName: string, value: number): void;
}
