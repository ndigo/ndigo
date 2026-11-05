[**@ndigo/http v0.0.1**](../../../README.md)

***

[@ndigo/http](../../../README.md) / [transformers/composition-transformer](../README.md) / CompositionTransformer

# Class: CompositionTransformer\<TInput, TOutput\>

Composes a sequence of body transforms into a single transformer.

## Type Parameters

### TInput

`TInput` = `unknown`

### TOutput

`TOutput` = `unknown`

## Implements

- [`HTTPTransformer`](../../http-transformer/interfaces/HTTPTransformer.md)\<`TInput`, `TOutput`\>

## Constructors

### Constructor

> **new CompositionTransformer**\<`TInput`, `TOutput`\>(`transforms`, `condition?`): `CompositionTransformer`\<`TInput`, `TOutput`\>

Creates a composed transformer.

#### Parameters

##### transforms

((`value`) => `unknown`)[]

The transform pipeline to execute in order.

##### condition?

(`body`, `context`) => `boolean`

Optional predicate that controls whether the pipeline runs.

#### Returns

`CompositionTransformer`\<`TInput`, `TOutput`\>

## Methods

### canTransform()

> **canTransform**(`body`, `context`): `boolean`

Tests whether the pipeline should run for the current body.

#### Parameters

##### body

`TInput`

The body to inspect.

##### context

[`TransformContext`](../../http-transformer/interfaces/TransformContext.md)

The current transform context.

#### Returns

`boolean`

`true` when the pipeline should execute.

#### Implementation of

[`HTTPTransformer`](../../http-transformer/interfaces/HTTPTransformer.md).[`canTransform`](../../http-transformer/interfaces/HTTPTransformer.md#cantransform)

***

### transform()

> **transform**(`body`, `context`): `TOutput`

Applies the composed transform pipeline.

#### Parameters

##### body

`TInput`

The body to transform.

##### context

[`TransformContext`](../../http-transformer/interfaces/TransformContext.md)

The current transform context.

#### Returns

`TOutput`

The transformed body.

#### Implementation of

[`HTTPTransformer`](../../http-transformer/interfaces/HTTPTransformer.md).[`transform`](../../http-transformer/interfaces/HTTPTransformer.md#transform)
