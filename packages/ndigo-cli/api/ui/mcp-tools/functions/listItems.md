[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [ui/mcp-tools](../README.md) / listItems

# Function: listItems()

> **listItems**(`context`, `filters`): `Promise`\<\{ `count`: `number`; `items`: `object`[]; `source`: `string`; \}\>

Lists registry items, optionally filtered by type, category, or text.

## Parameters

### context

[`RegistryToolContext`](../interfaces/RegistryToolContext.md)

Registry context.

### filters

[`ItemFilters`](../interfaces/ItemFilters.md) & `object`

Optional filters.

## Returns

`Promise`\<\{ `count`: `number`; `items`: `object`[]; `source`: `string`; \}\>

The source and compact item records.
