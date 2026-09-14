/**
 * @module blue-management
 * @since 1.0.0
 * @author Jeff Rose
 */
import { getMapping, requestMapping } from '@blue/dispatcher';
import { FeatureMetricAggregator } from '@blue/telemetry';
import { ApplicationContext, AsApplicationContextAware } from '@blue/context';
import { Null } from '@blue/core';
import { METRIC_AGGREGATOR } from './metric-aggregator-token';

/**
 * Serves aggregated application metrics under `/metrics`.
 *
 * Reads the context-level {@link FeatureMetricAggregator} (populated by the
 * `counted` decorator and feature code) and serializes per-feature counters,
 * gauges, and durations as JSON — the Blue-native pull view over telemetry.
 *
 * @since 1.0.0
 */
@requestMapping('/metrics')
export class MetricsController extends AsApplicationContextAware(Null) {
    readonly applicationContext!: ApplicationContext;

    /**
     * Returns the full metrics snapshot.
     *
     * @returns `{ features: { <feature>: { counters, gauges, updatedAt } } }`,
     *   or `{ error }` when no aggregator is wired.
     */
    @getMapping('/')
    metrics() {
        const aggregator = this.applicationContext?.getValue<FeatureMetricAggregator>(METRIC_AGGREGATOR);
        if (!aggregator) {
            return { error: 'No metric aggregator wired' };
        }

        const features: Record<
            string,
            {
                counters: Record<string, number>;
                gauges: Record<string, number>;
                updatedAt: string;
            }
        > = {};

        for (const name of aggregator.featureNames) {
            const metrics = aggregator.getFeatureMetrics(name);
            if (!metrics) {
                continue;
            }
            features[name] = {
                counters: Object.fromEntries(metrics.counters),
                gauges: Object.fromEntries(metrics.gauges),
                updatedAt: metrics.updatedAt.toISOString(),
            };
        }

        return { features };
    }
}
