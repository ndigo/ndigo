[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [ui/mcp-server](../README.md) / startRegistryServer

# Function: startRegistryServer()

> **startRegistryServer**(`options`): `Promise`\<`void`\>

Starts the server on stdin/stdout. Stdout is reserved for JSON-RPC, so all
diagnostics go to stderr.

## Parameters

### options

[`RegistryServerOptions`](../interfaces/RegistryServerOptions.md)

Application directory, default registry, and mode.

## Returns

`Promise`\<`void`\>
