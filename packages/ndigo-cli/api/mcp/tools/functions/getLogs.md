[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [mcp/tools](../README.md) / getLogs

# Function: getLogs()

> **getLogs**(`context`, `request?`): `Promise`\<\{ `content`: `string`; `file`: `string`; `lines`: `number`; \}\>

Returns the tail of the application log file.

## Parameters

### context

[`AppToolContext`](../interfaces/AppToolContext.md)

The application context.

### request?

[`LogRequest`](../interfaces/LogRequest.md) = `{}`

The path override and line count.

## Returns

`Promise`\<\{ `content`: `string`; `file`: `string`; `lines`: `number`; \}\>

The resolved path and retained text.
