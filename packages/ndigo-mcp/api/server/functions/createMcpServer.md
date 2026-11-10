[**@ndigo/mcp v0.0.1**](../../README.md)

***

[@ndigo/mcp](../../README.md) / [server](../README.md) / createMcpServer

# Function: createMcpServer()

> **createMcpServer**(`registry`, `options?`): `Server`

Creates an MCP server over a tool registry.

## Parameters

### registry

[`McpToolRegistry`](../../registry/classes/McpToolRegistry.md)

The projected tools.

### options?

[`McpServerOptions`](../interfaces/McpServerOptions.md) = `{}`

Identity and the optional inspect manifest.

## Returns

`Server`

A server ready to connect to a transport.
