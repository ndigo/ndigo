[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [ndigo-http](../README.md) / HTTPTransformer

# Interface: HTTPTransformer\<TInput, TOutput\>

Contract for request/response body transformers.

Inspired by the `HttpMessageConverter` pattern.

## Type Parameters

### TInput

`TInput` = `unknown`

### TOutput

`TOutput` = `unknown`

## Methods

### canTransform()

> **canTransform**(`body`, `context`): `boolean`

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
