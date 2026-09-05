/**
 * @author Jeff Rose
 */

import { configuration, entry } from '@blue/context';
import { FeatureMetricAggregator } from '@blue/telemetry';
import { HealthRegistry } from './health';
import { MetricsController } from './metrics-controller';
import { HealthController } from './health-controller';

/**
 * Auto-configuration for management endpoints.
 *
 * Registers:
 * - a shared {@link FeatureMetricAggregator} entry (read by `/metrics` and by
 *   any feature using `counted`)
 * - a {@link HealthRegistry} with the {@link TelemetryHealthIndicator} wired
 * - the `/metrics` and `/health` controllers
 *
 * Register alongside `NodeAutoConfiguration` in a Node application:
 *
 * ```ts
 * const app = new ApplicationBuilder([NodeAutoConfiguration, ManagementAutoConfiguration]);
 * ```
 *
 * @since 1.0.0
 */
@configuration
export class ManagementAutoConfiguration {
    /**
     * The shared feature-metric aggregator backing `/metrics`.
     *
     * @returns A fresh aggregator.
     */
    @entry
    metricAggregator(): FeatureMetricAggregator {
        return new FeatureMetricAggregator();
    }

    /**
     * The health registry. The `/health` controller adds the telemetry
     * indicator at request time from the context aggregator.
     *
     * @returns An empty (populated lazily) registry.
     */
    @entry
    healthRegistry(): HealthRegistry {
        return new HealthRegistry();
    }

    /**
     * Serves `/metrics`.
     *
     * @returns The metrics controller.
     */
    @entry
    metricsController(): MetricsController {
        return new MetricsController();
    }

    /**
     * Serves `/health`.
     *
     * @returns The health controller.
     */
    @entry
    healthController(): HealthController {
        return new HealthController();
    }
}
