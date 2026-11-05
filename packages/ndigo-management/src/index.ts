/**
 * Ndigo management endpoints — actuator-style `/health`, `/metrics`,
 * `/loggers`, `/env` and `/configprops` (AD-76).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
export { HealthRegistry, HEALTH_ERROR_REDACTED } from './health';
export type { HealthRegistryOptions, HealthState, HealthResult, HealthIndicator, HealthStatus } from './health';
export { METRIC_AGGREGATOR } from './metric-aggregator-tokens';
export { HEALTH_REGISTRY } from './health-registry-tokens';
export { MetricsController } from './metrics-controller';
export { HealthController, HealthResponseView } from './health-controller';
export { TelemetryHealthIndicator } from './telemetry-health-indicator';
export { ManagementAutoConfiguration } from './management-auto-configuration';
export type { ManagementAutoConfigurationOptions } from './management-auto-configuration';
export { LoggersController } from './loggers-controller';
export { EnvironmentController } from './environment-controller';
export { ConfigurationPropertiesController } from './configuration-properties-controller';
export {
    MANAGEMENT_ENDPOINT_IDS,
    DEFAULT_EXPOSURE,
    managementSchema,
    readManagementSettings,
    resolveExposure,
    endpointPath,
} from './management-properties';
export type { ManagementProperties } from './management-properties';
