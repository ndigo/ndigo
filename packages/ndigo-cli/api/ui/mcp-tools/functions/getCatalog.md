[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [ui/mcp-tools](../README.md) / getCatalog

# Function: getCatalog()

> **getCatalog**(`context`, `override?`): `Promise`\<\{ `catalog`: [`A2uiCatalog`](../../catalog/interfaces/A2uiCatalog.md); `installed`: `string`[]; `source`: `string`; \}\>

Returns the A2UI catalog of installed renderable registry items.

## Parameters

### context

[`RegistryToolContext`](../interfaces/RegistryToolContext.md)

Registry context.

### override?

`string`

Optional registry source override.

## Returns

`Promise`\<\{ `catalog`: [`A2uiCatalog`](../../catalog/interfaces/A2uiCatalog.md); `installed`: `string`[]; `source`: `string`; \}\>

The registry source, installed item names, and the catalog.
