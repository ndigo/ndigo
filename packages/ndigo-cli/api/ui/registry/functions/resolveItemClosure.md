[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [ui/registry](../README.md) / resolveItemClosure

# Function: resolveItemClosure()

> **resolveItemClosure**(`registry`, `names`): [`LocatedRegistryItem`](../../registry-types/interfaces/LocatedRegistryItem.md)[]

Resolves an item's registry dependencies in install order (dependencies
first), rejecting cycles and unknown names.

## Parameters

### registry

[`LoadedRegistry`](../../registry-types/interfaces/LoadedRegistry.md)

Loaded registry.

### names

readonly `string`[]

Requested item names.

## Returns

[`LocatedRegistryItem`](../../registry-types/interfaces/LocatedRegistryItem.md)[]

Items in dependency-first order.
