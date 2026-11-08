[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [producer-writer](../README.md) / writeRenderResult

# Function: writeRenderResult()

> **writeRenderResult**(`res`, `result`): `Promise`\<`void`\>

Writes a [RenderResult](#) to an HTTP response.

## Parameters

### res

`ServerResponse`\<`IncomingMessage`\> \| `undefined`

The response to write to; a no-op when absent or already sent.

### result

[`RenderResult`](#)

The response document.

## Returns

`Promise`\<`void`\>

A promise that resolves once written.
