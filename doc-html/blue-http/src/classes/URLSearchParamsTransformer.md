[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / URLSearchParamsTransformer

# Class: URLSearchParamsTransformer

Defined in: [packages/blue-http/src/transformers/url-search-params-transformer.ts:15](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/transformers/url-search-params-transformer.ts#lines-15)

Transforms `URLSearchParams` entries one by one.

## Implements

- [`HTTPTransformer`](../interfaces/HTTPTransformer.md)\<`URLSearchParams`, `URLSearchParams`\>

## Constructors

### Constructor

> **new URLSearchParamsTransformer**(`entryTransform`, `postProcess?`, `condition?`): `URLSearchParamsTransformer`

Defined in: [packages/blue-http/src/transformers/url-search-params-transformer.ts:27](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/transformers/url-search-params-transformer.ts#lines-27)

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

Defined in: [packages/blue-http/src/transformers/url-search-params-transformer.ts:44](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/transformers/url-search-params-transformer.ts#lines-44)

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

Defined in: [packages/blue-http/src/transformers/url-search-params-transformer.ts:59](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/transformers/url-search-params-transformer.ts#lines-59)

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
