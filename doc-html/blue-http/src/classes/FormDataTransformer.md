[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / FormDataTransformer

# Class: FormDataTransformer

Defined in: [packages/blue-http/src/transformers/form-data-transformer.ts:15](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/transformers/form-data-transformer.ts#lines-15)

Transforms `FormData` entries one by one while preserving multipart semantics.

## Implements

- [`HTTPTransformer`](../interfaces/HTTPTransformer.md)\<`FormData`, `FormData`\>

## Constructors

### Constructor

> **new FormDataTransformer**(`entryTransform`, `condition?`): `FormDataTransformer`

Defined in: [packages/blue-http/src/transformers/form-data-transformer.ts:25](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/transformers/form-data-transformer.ts#lines-25)

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

Defined in: [packages/blue-http/src/transformers/form-data-transformer.ts:40](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/transformers/form-data-transformer.ts#lines-40)

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

Defined in: [packages/blue-http/src/transformers/form-data-transformer.ts:55](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/transformers/form-data-transformer.ts#lines-55)

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
