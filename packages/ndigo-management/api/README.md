**@ndigo/management v0.0.1**

***

# @ndigo/management v0.0.1

Ndigo management endpoints — actuator-style `/health`, `/metrics`,
`/loggers`, `/env` and `/configprops` (AD-76).

## Since

1.0.0

## Author

Jeff Rose

## Classes

- [ConfigurationPropertiesController](classes/ConfigurationPropertiesController.md)
- [EnvironmentController](classes/EnvironmentController.md)
- [HealthController](classes/HealthController.md)
- [HealthRegistry](classes/HealthRegistry.md)
- [HealthResponseView](classes/HealthResponseView.md)
- [LoggersController](classes/LoggersController.md)
- [ManagementAutoConfiguration](classes/ManagementAutoConfiguration.md)
- [MetricsController](classes/MetricsController.md)
- [TelemetryHealthIndicator](classes/TelemetryHealthIndicator.md)

## Interfaces

- [HealthIndicator](interfaces/HealthIndicator.md)
- [HealthRegistryOptions](interfaces/HealthRegistryOptions.md)
- [HealthResult](interfaces/HealthResult.md)
- [HealthStatus](interfaces/HealthStatus.md)
- [ManagementAutoConfigurationOptions](interfaces/ManagementAutoConfigurationOptions.md)

## Type Aliases

- [HealthState](type-aliases/HealthState.md)
- [ManagementProperties](type-aliases/ManagementProperties.md)

## Variables

- [DEFAULT\_EXPOSURE](variables/DEFAULT_EXPOSURE.md)
- [HEALTH\_ERROR\_REDACTED](variables/HEALTH_ERROR_REDACTED.md)
- [HEALTH\_REGISTRY](variables/HEALTH_REGISTRY.md)
- [MANAGEMENT\_ENDPOINT\_IDS](variables/MANAGEMENT_ENDPOINT_IDS.md)
- [managementSchema](variables/managementSchema.md)
- [METRIC\_AGGREGATOR](variables/METRIC_AGGREGATOR.md)

## Functions

- [endpointPath](functions/endpointPath.md)
- [readManagementSettings](functions/readManagementSettings.md)
- [resolveExposure](functions/resolveExposure.md)
