/**
 * Blue management endpoints — actuator-style `/health` and `/metrics`.
 *
 * @module
 */

export { HealthRegistry } from './health';
export type { HealthState, HealthResult, HealthIndicator, HealthStatus } from './health';
export { METRIC_AGGREGATOR } from './metric-aggregator-token';
export { HEALTH_REGISTRY } from './health-registry-token';
export { MetricsController } from './metrics-controller';
export { HealthController } from './health-controller';
export { TelemetryHealthIndicator } from './telemetry-health-indicator';
export { ManagementAutoConfiguration } from './management-auto-configuration';
