[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / JSONTransformer

# Class: JSONTransformer

Defined in: [packages/blue-http/src/transformers/json-transformer.ts:11](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/transformers/json-transformer.ts#lines-11)

Applies a pipeline of transforms to JSON bodies.

## Implements

- [`HTTPTransformer`](../interfaces/HTTPTransformer.md)\<`JSONObject`, `JSONObject`\>

## Constructors

### Constructor

> **new JSONTransformer**(`transforms`, `condition?`): `JSONTransformer`

Defined in: [packages/blue-http/src/transformers/json-transformer.ts:21](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/transformers/json-transformer.ts#lines-21)

Creates a JSON transformer.

#### Parameters

##### transforms

(`value`) => `JSONObject`[]

The transform pipeline to apply.

##### condition?

(`body`, `context`) => `boolean`

Optional predicate that controls whether the transform runs.

#### Returns

`JSONTransformer`

## Methods

### canTransform()

> **canTransform**(`body`, `context`): `boolean`

Defined in: [packages/blue-http/src/transformers/json-transformer.ts:41](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/transformers/json-transformer.ts#lines-41)

Tests whether the input is a JSON object that should be transformed.

#### Parameters

##### body

`JSONObject`

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

> **transform**(`body`, `context`): `JSONObject`

Defined in: [packages/blue-http/src/transformers/json-transformer.ts:56](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/transformers/json-transformer.ts#lines-56)

Applies the JSON transform pipeline.

#### Parameters

##### body

`JSONObject`

The JSON body to transform.

##### context

[`TransformContext`](../interfaces/TransformContext.md)

The current transform context.

#### Returns

`JSONObject`

The transformed JSON body.

#### Implementation of

[`HTTPTransformer`](../interfaces/HTTPTransformer.md).[`transform`](../interfaces/HTTPTransformer.md#transform)
