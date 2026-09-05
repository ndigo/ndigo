[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / Transform

# Type Alias: Transform\<TInput, TOutput\>

> **Transform**\<`TInput`, `TOutput`\> = [`HTTPTransformer`](../interfaces/HTTPTransformer.md)\<`TInput`, `TOutput`\> \| ((`body`, `context`) => `TOutput` \| `Promise`\<`TOutput`\>)

Defined in: [packages/blue-http/src/transformers/http-transformer.ts:65](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/transformers/http-transformer.ts#lines-65)

User-provided transform function or transformer object.

## Type Parameters

### TInput

`TInput` = `any`

### TOutput

`TOutput` = `any`
