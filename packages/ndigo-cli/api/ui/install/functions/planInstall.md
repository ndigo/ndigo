[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [ui/install](../README.md) / planInstall

# Function: planInstall()

> **planInstall**(`registry`, `names`, `aliases`): `Promise`\<[`InstallPlan`](../interfaces/InstallPlan.md)\>

Resolves the requested items and their registry dependencies, reads every
file body, and maps targets to application paths.

## Parameters

### registry

[`LoadedRegistry`](../../registry-types/interfaces/LoadedRegistry.md)

Loaded registry.

### names

readonly `string`[]

Requested item names.

### aliases

[`UiAliases`](../../config/interfaces/UiAliases.md)

Alias table.

## Returns

`Promise`\<[`InstallPlan`](../interfaces/InstallPlan.md)\>

The install plan.
