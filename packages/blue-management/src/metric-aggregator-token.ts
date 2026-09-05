import { ContextToken } from '@blue/context';
import { FeatureMetricAggregator } from '@blue/telemetry';

/**
 * Context token for the shared {@link FeatureMetricAggregator} entry that
 * management endpoints read. Apps wire one (e.g. via
 * `ManagementAutoConfiguration`) so `/metrics` reflects live counters.
 */
export const METRIC_AGGREGATOR = new ContextToken<FeatureMetricAggregator>('metricAggregator');
