[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [ndigo-http](../README.md) / FormDataTransformer

# Class: FormDataTransformer

Transforms `FormData` entries one by one while preserving multipart semantics.

## Implements

- [`HTTPTransformer`](../interfaces/HTTPTransformer.md)\<`FormData`, `FormData`\>

## Constructors

### Constructor

> **new FormDataTransformer**(`entryTransform`, `condition?`): `FormDataTransformer`

Creates a `FormData` transformer.

#### Parameters

##### entryTransform

[`FormDataEntryTransform`](../type-aliases/FormDataEntryTransform.md)

The per-entry transform to apply.

##### condition?

(`body`, `context`) => `boolean`

Optional predicate that controls whether the transform runs.

#### Returns

`FormDataTransformer`

## Methods

### canTransform()

> **canTransform**(`body`, `context`): `boolean`

Tests whether the input is a `FormData` value that should be transformed.

#### Parameters

##### body

`FormData`

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

> **transform**(`body`, `context`): `FormData`

Applies the entry transform to each `FormData` item.

#### Parameters

##### body

`FormData`

The `FormData` to transform.

##### context

[`TransformContext`](../interfaces/TransformContext.md)

The current transform context.

#### Returns

`FormData`

A new `FormData` instance.

#### Implementation of

[`HTTPTransformer`](../interfaces/HTTPTransformer.md).[`transform`](../interfaces/HTTPTransformer.md#transform)
