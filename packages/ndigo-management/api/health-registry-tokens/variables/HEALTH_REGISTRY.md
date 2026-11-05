[**@ndigo/management v0.0.1**](../../README.md)

***

[@ndigo/management](../../README.md) / [health-registry-tokens](../README.md) / HEALTH\_REGISTRY

# Variable: HEALTH\_REGISTRY

> `const` **HEALTH\_REGISTRY**: [`ContextToken`](#)\<[`HealthRegistry`](../../health/classes/HealthRegistry.md)\>

Context token for the shared [HealthRegistry](../../health/classes/HealthRegistry.md) that the `/health`
endpoint reads. `ManagementAutoConfiguration` registers one and populates it
with indicator wiring.
