[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / HTTPTransformer

# Interface: HTTPTransformer\<TInput, TOutput\>

Defined in: packages/blue-http/src/transformers/http-transformer.ts:42

Contract for request/response body transformers.

Inspired by Spring Framework's `HttpMessageConverter` pattern.

## Type Parameters

### TInput

`TInput` = `any`

### TOutput

`TOutput` = `any`

## Methods

### canTransform()

> **canTransform**(`body`, `context`): `boolean`

Defined in: packages/blue-http/src/transformers/http-transformer.ts:50

Determines if this transformer can handle the given body and context.

#### Parameters

##### body

`TInput`

Request/response body to potentially transform

##### context

[`TransformContext`](TransformContext.md)

Context information for conditional logic

#### Returns

`boolean`

true if this transformer should be applied

***

### transform()

> **transform**(`body`, `context`): `TOutput` \| `Promise`\<`TOutput`\>

Defined in: packages/blue-http/src/transformers/http-transformer.ts:59

Transforms the request/response body.

#### Parameters

##### body

`TInput`

Request/response body to transform

##### context

[`TransformContext`](TransformContext.md)

Context information for transformation logic

#### Returns

`TOutput` \| `Promise`\<`TOutput`\>

Transformed body (sync or async)
