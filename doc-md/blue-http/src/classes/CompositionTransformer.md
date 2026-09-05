[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / CompositionTransformer

# Class: CompositionTransformer\<TInput, TOutput\>

Defined in: [packages/blue-http/src/transformers/composition-transformer.ts:10](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/transformers/composition-transformer.ts#lines-10)

Composes a sequence of body transforms into a single transformer.

## Type Parameters

### TInput

`TInput` = `unknown`

### TOutput

`TOutput` = `unknown`

## Implements

- [`HTTPTransformer`](../interfaces/HTTPTransformer.md)\<`TInput`, `TOutput`\>

## Constructors

### Constructor

> **new CompositionTransformer**\<`TInput`, `TOutput`\>(`transforms`, `condition?`): `CompositionTransformer`\<`TInput`, `TOutput`\>

Defined in: [packages/blue-http/src/transformers/composition-transformer.ts:20](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/transformers/composition-transformer.ts#lines-20)

Creates a composed transformer.

#### Parameters

##### transforms

(`value`) => `unknown`[]

The transform pipeline to execute in order.

##### condition?

(`body`, `context`) => `boolean`

Optional predicate that controls whether the pipeline runs.

#### Returns

`CompositionTransformer`\<`TInput`, `TOutput`\>

## Methods

### canTransform()

> **canTransform**(`body`, `context`): `boolean`

Defined in: [packages/blue-http/src/transformers/composition-transformer.ts:40](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/transformers/composition-transformer.ts#lines-40)

Tests whether the pipeline should run for the current body.

#### Parameters

##### body

`TInput`

The body to inspect.

##### context

[`TransformContext`](../interfaces/TransformContext.md)

The current transform context.

#### Returns

`boolean`

`true` when the pipeline should execute.

#### Implementation of

[`HTTPTransformer`](../interfaces/HTTPTransformer.md).[`canTransform`](../interfaces/HTTPTransformer.md#cantransform)

***

### transform()

> **transform**(`body`, `context`): `TOutput`

Defined in: [packages/blue-http/src/transformers/composition-transformer.ts:51](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/transformers/composition-transformer.ts#lines-51)

Applies the composed transform pipeline.

#### Parameters

##### body

`TInput`

The body to transform.

##### context

[`TransformContext`](../interfaces/TransformContext.md)

The current transform context.

#### Returns

`TOutput`

The transformed body.

#### Implementation of

[`HTTPTransformer`](../interfaces/HTTPTransformer.md).[`transform`](../interfaces/HTTPTransformer.md#transform)
