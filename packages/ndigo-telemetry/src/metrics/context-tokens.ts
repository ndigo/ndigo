/**
 * Context tokens for `@ndigo/telemetry`.
 */
import { ContextToken } from '@ndigo/factory';
import type { FeatureMetricAggregator } from './feature-metric-aggregator';

/**
 * Token for the application's shared {@link FeatureMetricAggregator} entry.
 * `ManagementAutoConfiguration` registers one under the matching
 * `'metricAggregator'` description; consumers resolve it with
 * `context.getValue(FEATURE_METRIC_AGGREGATOR)` (or receive it via
 * `FeatureMetricAggregatorAware`).
 */
export const FEATURE_METRIC_AGGREGATOR = new ContextToken<FeatureMetricAggregator>('metricAggregator');
