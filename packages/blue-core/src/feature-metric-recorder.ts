/**
 * @author Jeff Rose
 */

/**
 * Contract for recording feature-level metrics.
 */
export interface FeatureMetricRecorder {
    incrementCounter(feature: string, metricName: string, value?: number): void;
    recordDuration?(feature: string, metricName: string, durationMs: number): void;
    setGauge?(feature: string, metricName: string, value: number): void;
}
