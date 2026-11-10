[**@ndigo/mcp v0.0.1**](../../README.md)

***

[@ndigo/mcp](../../README.md) / [server](../README.md) / startStdioServer

# Function: startStdioServer()

> **startStdioServer**(`registry`, `options?`): `Promise`\<`void`\>

Starts a server on stdin/stdout. Stdout is reserved for JSON-RPC.

## Parameters

### registry

[`McpToolRegistry`](../../registry/classes/McpToolRegistry.md)

The projected tools.

### options?

[`McpServerOptions`](../interfaces/McpServerOptions.md) = `{}`

Identity and the optional inspect manifest.

## Returns

`Promise`\<`void`\>

A promise that resolves once the transport is connected.
