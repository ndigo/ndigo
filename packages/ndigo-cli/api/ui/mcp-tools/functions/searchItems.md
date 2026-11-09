[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [ui/mcp-tools](../README.md) / searchItems

# Function: searchItems()

> **searchItems**(`context`, `query`, `limit?`, `override?`): `Promise`\<\{ `count`: `number`; `query`: `string`; `results`: `object`[]; `source`: `string`; \}\>

Searches items by name, title, description, docs, or category.

## Parameters

### context

[`RegistryToolContext`](../interfaces/RegistryToolContext.md)

Registry context.

### query

`string`

Search text.

### limit?

`number` = `10`

Maximum results (default 10).

### override?

`string`

Optional registry source override.

## Returns

`Promise`\<\{ `count`: `number`; `query`: `string`; `results`: `object`[]; `source`: `string`; \}\>

Ranked matches.
