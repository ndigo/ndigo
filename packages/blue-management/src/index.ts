/**
 * Blue management endpoints — actuator-style `/health` and `/metrics`.
 * * @module blue-management
 * @since 1.0.0
 * @author Jeff Rose
 */
export { HealthRegistry, HEALTH_ERROR_REDACTED } from './health';
export type { HealthRegistryOptions, HealthState, HealthResult, HealthIndicator, HealthStatus } from './health';
export { METRIC_AGGREGATOR } from './metric-aggregator-tokens';
export { HEALTH_REGISTRY } from './health-registry-tokens';
export { MetricsController } from './metrics-controller';
export { HealthController } from './health-controller';
export { TelemetryHealthIndicator } from './telemetry-health-indicator';
export { ManagementAutoConfiguration } from './management-auto-configuration';
