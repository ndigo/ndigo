[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [mcp/server](../README.md) / startAppServer

# Function: startAppServer()

> **startAppServer**(`options`): `Promise`\<`void`\>

Starts `ndigo mcp`. The static profile connects the tool server to stdio;
`--live` hands stdio to the application's `scripts.mcp` instead.

## Parameters

### options

[`AppServerOptions`](../interfaces/AppServerOptions.md)

Application directory and mode.

## Returns

`Promise`\<`void`\>

A promise that settles when the server (or delegated script) ends.
