[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-management/src](../README.md) / HEALTH\_REGISTRY

# Variable: HEALTH\_REGISTRY

> `const` **HEALTH\_REGISTRY**: [`ContextToken`](../../../blue-context/src/classes/ContextToken.md)\<[`HealthRegistry`](../classes/HealthRegistry.md)\>

Defined in: packages/blue-management/src/health-registry-token.ts:13

Context token for the shared [HealthRegistry](../classes/HealthRegistry.md) that the `/health`
endpoint reads. `ManagementAutoConfiguration` registers one and populates it
with indicator wiring.
