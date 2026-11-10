[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [mcp/tools](../README.md) / getDiagnostics

# Function: getDiagnostics()

> **getDiagnostics**(`context`): `Promise`\<\{ `exitCode`: `number`; `failures`: readonly `string`[]; `ok`: `boolean`; `rows`: readonly `string`[]; \}\>

Collects the environment and workspace diagnostics for the application.

## Parameters

### context

[`AppToolContext`](../interfaces/AppToolContext.md)

The application context.

## Returns

`Promise`\<\{ `exitCode`: `number`; `failures`: readonly `string`[]; `ok`: `boolean`; `rows`: readonly `string`[]; \}\>

The printable rows, failures, and exit code.
