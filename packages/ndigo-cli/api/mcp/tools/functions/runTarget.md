[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [mcp/tools](../README.md) / runTarget

# Function: runTarget()

> **runTarget**(`context`, `request`): `Promise`\<\{ `exitCode`: `number`; `stderr`: `string`; `stdout`: `string`; `target`: [`AppTarget`](../type-aliases/AppTarget.md); \}\>

Runs one of the application's build, test, or lint scripts and captures
its output.

## Parameters

### context

[`AppToolContext`](../interfaces/AppToolContext.md)

The application context.

### request

The target script to run.

#### target

[`AppTarget`](../type-aliases/AppTarget.md)

## Returns

`Promise`\<\{ `exitCode`: `number`; `stderr`: `string`; `stdout`: `string`; `target`: [`AppTarget`](../type-aliases/AppTarget.md); \}\>

The target, its exit code, and captured output.
