[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / TransformInterceptor

# Class: TransformInterceptor

Defined in: packages/blue-http/src/interceptors/transform-interceptor.ts:14

Applies request and response body transforms at the interceptor boundary.

It runs after header setup so transforms can rely on the declared content
type and other request context.

## Implements

- [`RequestAwareHTTPInterceptor`](../interfaces/RequestAwareHTTPInterceptor.md)
- [`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md)

## Constructors

### Constructor

> **new TransformInterceptor**(`requestTransforms?`, `responseTransforms?`): `TransformInterceptor`

Defined in: packages/blue-http/src/interceptors/transform-interceptor.ts:15

#### Parameters

##### requestTransforms?

[`Transform`](../type-aliases/Transform.md)[] = `[]`

##### responseTransforms?

[`Transform`](../type-aliases/Transform.md)[] = `[]`

#### Returns

`TransformInterceptor`

## Methods

### preRequest()

> **preRequest**(`request`): `Promise`\<`Request`\>

Defined in: packages/blue-http/src/interceptors/transform-interceptor.ts:26

Applies request body transformations.

#### Parameters

##### request

`Request`

The request to transform.

#### Returns

`Promise`\<`Request`\>

A replacement request when a transform changes the body.

#### Implementation of

[`RequestAwareHTTPInterceptor`](../interfaces/RequestAwareHTTPInterceptor.md).[`preRequest`](../interfaces/RequestAwareHTTPInterceptor.md#prerequest)

***

### postResponse()

> **postResponse**(`response`): `Promise`\<`void` \| `Response`\>

Defined in: packages/blue-http/src/interceptors/transform-interceptor.ts:62

Applies response body transformations.

#### Parameters

##### response

`Response`

The response to transform.

#### Returns

`Promise`\<`void` \| `Response`\>

A replacement response when a transform changes the body.

#### Implementation of

[`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md).[`postResponse`](../interfaces/ResponseAwareHTTPInterceptor.md#postresponse)
