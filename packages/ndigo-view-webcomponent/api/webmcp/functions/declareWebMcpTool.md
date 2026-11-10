[**@ndigo/view-webcomponent v0.0.1**](../../README.md)

***

[@ndigo/view-webcomponent](../../README.md) / [webmcp](../README.md) / declareWebMcpTool

# Function: declareWebMcpTool()

> **declareWebMcpTool**(`tool`, `options?`): `Promise`\<[`WebMcpRegistration`](../interfaces/WebMcpRegistration.md)\>

Registers one WebMCP tool. Unsupported browsers return a no-op registration.

## Parameters

### tool

[`WebMcpTool`](../interfaces/WebMcpTool.md)

The tool definition.

### options?

[`WebMcpOptions`](../interfaces/WebMcpOptions.md) = `{}`

Optional external cancellation signal.

## Returns

`Promise`\<[`WebMcpRegistration`](../interfaces/WebMcpRegistration.md)\>

The registration handle.
