/**
 * Ndigo management endpoints — actuator-style `/health`, `/metrics`,
 * `/loggers`, `/env` and `/configprops`.
 */
export { HealthRegistry } from './health';
export type { HealthRegistryOptions, HealthState, HealthResult, HealthIndicator, HealthStatus } from './health';
export { METRIC_AGGREGATOR } from './metric-aggregator-tokens';
export { HEALTH_REGISTRY } from './health-registry-tokens';
export { TelemetryHealthIndicator } from './telemetry-health-indicator';
export { ManagementAutoConfiguration } from './management-auto-configuration';
export type { ManagementAutoConfigurationOptions } from './management-auto-configuration';
export type { ManagementProperties } from './management-properties';
