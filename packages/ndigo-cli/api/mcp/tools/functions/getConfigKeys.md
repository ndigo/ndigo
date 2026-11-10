[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [mcp/tools](../README.md) / getConfigKeys

# Function: getConfigKeys()

> **getConfigKeys**(`context`): `Promise`\<\{ `keys`: readonly [`AppConfigEntry`](../interfaces/AppConfigEntry.md)[]; \}\>

Returns the declared configuration keys. Values are never part of the
manifest, so they cannot leak through this tool.

## Parameters

### context

[`AppToolContext`](../interfaces/AppToolContext.md)

The application context.

## Returns

`Promise`\<\{ `keys`: readonly [`AppConfigEntry`](../interfaces/AppConfigEntry.md)[]; \}\>

The value-free configuration entries.
