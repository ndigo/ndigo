[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [ui/mcp-tools](../README.md) / validateRegistrySource

# Function: validateRegistrySource()

> **validateRegistrySource**(`context`, `override?`): `Promise`\<\{ `errors`: `string`[]; `items`: `number`; `source`: `string`; `valid`: `boolean`; \}\>

Validates a registry source without throwing on shape errors.

## Parameters

### context

[`RegistryToolContext`](../interfaces/RegistryToolContext.md)

Registry context.

### override?

`string`

Optional registry source override.

## Returns

`Promise`\<\{ `errors`: `string`[]; `items`: `number`; `source`: `string`; `valid`: `boolean`; \}\>

Validity, item count, and errors.
