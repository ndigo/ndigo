[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [ui/catalog](../README.md) / buildCatalog

# Function: buildCatalog()

> **buildCatalog**(`registry`, `installed`): [`A2uiCatalog`](../interfaces/A2uiCatalog.md)

Builds the A2UI catalog from the registry and the installed item names.
Only `registry:ui` and `registry:block` items are renderable components;
themes and libraries install supporting files but never appear.

## Parameters

### registry

[`LoadedRegistry`](../../registry-types/interfaces/LoadedRegistry.md)

The loaded registry.

### installed

readonly `string`[]

Item names from `ui.lock.json`.

## Returns

[`A2uiCatalog`](../interfaces/A2uiCatalog.md)

The catalog document.
