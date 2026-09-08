import { getMapping, requestMapping } from '@blue/dispatcher';
import { ApplicationContext, AsApplicationContextAware } from '@blue/context';
import { Null } from '@blue/core';
import { FeatureMetricAggregator } from '@blue/telemetry';
import { HealthRegistry } from './health';
import { HEALTH_REGISTRY } from './health-registry-token';
import { METRIC_AGGREGATOR } from './metric-aggregator-token';
import { TelemetryHealthIndicator } from './telemetry-health-indicator';

/**
 * Serves application health under `/health`.
 *
 * Runs the context-level {@link HealthRegistry} (all registered indicators),
 * plus a {@link TelemetryHealthIndicator} built at request time from the
 * context aggregator — so `/health` always reflects the telemetry pipeline,
 * even when the registry was wired without it.
 *
 * @since 1.0.0
 */
@requestMapping('/health')
export class HealthController extends AsApplicationContextAware(Null) {
    readonly applicationContext!: ApplicationContext;

    /**
     * Returns the aggregate health status.
     *
     * @returns `{ status, components, timestamp }`, or `{ status: 'UNKNOWN' }`
     *   when no registry is wired.
     */
    @getMapping('/')
    async health() {
        const registry = this.applicationContext?.getValue<HealthRegistry>(HEALTH_REGISTRY);
        if (!registry) {
            return { status: 'UNKNOWN', components: {}, timestamp: new Date().toISOString() };
        }

        const aggregator = this.applicationContext?.getValue<FeatureMetricAggregator>(METRIC_AGGREGATOR);
        registry.register(new TelemetryHealthIndicator(aggregator));

        return registry.checkAll();
    }
}
