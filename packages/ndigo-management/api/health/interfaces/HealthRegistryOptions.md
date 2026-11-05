[**@ndigo/management v0.0.1**](../../README.md)

***

[@ndigo/management](../../README.md) / [health](../README.md) / HealthRegistryOptions

# Interface: HealthRegistryOptions

Options for [HealthRegistry](../classes/HealthRegistry.md).

## Properties

### redactHealthErrors?

> `optional` **redactHealthErrors?**: `boolean`

Whether thrown indicator errors are redacted to
[HEALTH\_ERROR\_REDACTED](../variables/HEALTH_ERROR_REDACTED.md). Default `false` — the registry is a
shared API; the `/health` endpoint (AD-36) opts into redaction by
default via `ManagementAutoConfigurationOptions.redactHealthErrors`.
