[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [ndigo-http](../README.md) / URLSearchParamsTransformer

# Class: URLSearchParamsTransformer

Transforms `URLSearchParams` entries one by one.

## Implements

- [`HTTPTransformer`](../interfaces/HTTPTransformer.md)\<`URLSearchParams`, `URLSearchParams`\>

## Constructors

### Constructor

> **new URLSearchParamsTransformer**(`entryTransform`, `postProcess?`, `condition?`): `URLSearchParamsTransformer`

Creates a URLSearchParams transformer.

#### Parameters

##### entryTransform

[`URLSearchParamsEntryTransform`](../type-aliases/URLSearchParamsEntryTransform.md)

The per-entry transform to apply.

##### postProcess?

(`params`) => `URLSearchParams`

Optional final adjustment applied after entry transforms.

##### condition?

(`body`, `context`) => `boolean`

Optional predicate that controls whether the transform runs.

#### Returns

`URLSearchParamsTransformer`

## Methods

### canTransform()

> **canTransform**(`body`, `context`): `boolean`

Tests whether the input is a `URLSearchParams` value that should be transformed.

#### Parameters

##### body

`URLSearchParams`

The body to inspect.

##### context

[`TransformContext`](../interfaces/TransformContext.md)

The current transform context.

#### Returns

`boolean`

`true` when transformation should run.

#### Implementation of

[`HTTPTransformer`](../interfaces/HTTPTransformer.md).[`canTransform`](../interfaces/HTTPTransformer.md#cantransform)

***

### transform()

> **transform**(`body`, `context`): `URLSearchParams`

Applies the entry transform to each URL parameter.

#### Parameters

##### body

`URLSearchParams`

The params to transform.

##### context

[`TransformContext`](../interfaces/TransformContext.md)

The current transform context.

#### Returns

`URLSearchParams`

The transformed params.

#### Implementation of

[`HTTPTransformer`](../interfaces/HTTPTransformer.md).[`transform`](../interfaces/HTTPTransformer.md#transform)
