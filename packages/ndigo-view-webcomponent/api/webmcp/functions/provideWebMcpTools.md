[**@ndigo/view-webcomponent v0.0.1**](../../README.md)

***

[@ndigo/view-webcomponent](../../README.md) / [webmcp](../README.md) / provideWebMcpTools

# Function: provideWebMcpTools()

> **provideWebMcpTools**(`tools`, `options?`): `Promise`\<[`WebMcpRegistration`](../interfaces/WebMcpRegistration.md)\>

Registers a set of WebMCP tools under one AbortController.

## Parameters

### tools

readonly [`WebMcpTool`](../interfaces/WebMcpTool.md)[]

The tools to register.

### options?

[`WebMcpOptions`](../interfaces/WebMcpOptions.md) = `{}`

Optional external cancellation signal.

## Returns

`Promise`\<[`WebMcpRegistration`](../interfaces/WebMcpRegistration.md)\>

The registration handle; `dispose()` aborts the internal signal.
