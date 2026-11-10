[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [helpers/mcp-host](../README.md) / runTool

# Function: runTool()

> **runTool**(`run`): `Promise`\<\{\[`key`: `string`\]: `unknown`; \}\>

Runs one tool callback and maps the outcome to an MCP result: one JSON text
block on success, an `isError` text block carrying the message on failure.

## Parameters

### run

() => `unknown`

The tool body.

## Returns

`Promise`\<\{\[`key`: `string`\]: `unknown`; \}\>

The MCP tool result.
