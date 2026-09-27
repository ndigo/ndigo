[**@blue/http v0.0.1**](../../README.md)

***

[@blue/http](../../README.md) / [blue-http](../README.md) / Transform

# Type Alias: Transform\<TInput, TOutput\>

> **Transform**\<`TInput`, `TOutput`\> = [`HTTPTransformer`](../interfaces/HTTPTransformer.md)\<`TInput`, `TOutput`\> \| ((`body`, `context`) => `TOutput` \| `Promise`\<`TOutput`\>)

User-provided transform function or transformer object.

## Type Parameters

### TInput

`TInput` = `unknown`

### TOutput

`TOutput` = `unknown`
