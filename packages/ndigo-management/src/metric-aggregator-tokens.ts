/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ContextToken } from '@ndigo/context';
import { FeatureMetricAggregator } from '@ndigo/telemetry';

/**
 * Context token for the shared {@link FeatureMetricAggregator} entry that
 * management endpoints read. Apps wire one (e.g. via
 * `ManagementAutoConfiguration`) so `/metrics` reflects live counters.
 */
export const METRIC_AGGREGATOR = new ContextToken<FeatureMetricAggregator>('metricAggregator');
