[**@blue/http v0.0.1**](../../README.md)

***

[@blue/http](../../README.md) / [blue-http](../README.md) / JSONTransformer

# Class: JSONTransformer

Applies a pipeline of transforms to JSON bodies.

## Implements

- [`HTTPTransformer`](../interfaces/HTTPTransformer.md)\<`JSONObject`, `JSONObject`\>

## Constructors

### Constructor

> **new JSONTransformer**(`transforms`, `condition?`): `JSONTransformer`

Creates a JSON transformer.

#### Parameters

##### transforms

((`value`) => `JSONObject`)[]

The transform pipeline to apply.

##### condition?

(`body`, `context`) => `boolean`

Optional predicate that controls whether the transform runs.

#### Returns

`JSONTransformer`

## Methods

### canTransform()

> **canTransform**(`body`, `context`): `boolean`

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
