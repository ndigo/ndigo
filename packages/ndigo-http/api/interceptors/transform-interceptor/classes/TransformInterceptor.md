[**@ndigo/http v0.0.1**](../../../README.md)

***

[@ndigo/http](../../../README.md) / [interceptors/transform-interceptor](../README.md) / TransformInterceptor

# Class: TransformInterceptor

Applies request and response body transforms at the interceptor boundary.

It runs after header setup so transforms can rely on the declared content
type and other request context.

## Implements

- [`RequestAwareHTTPInterceptor`](../../../http-types/interfaces/RequestAwareHTTPInterceptor.md)
- [`ResponseAwareHTTPInterceptor`](../../../http-types/interfaces/ResponseAwareHTTPInterceptor.md)

## Constructors

### Constructor

> **new TransformInterceptor**(`requestTransforms?`, `responseTransforms?`): `TransformInterceptor`

#### Parameters

##### requestTransforms?

[`Transform`](../../../transformers/http-transformer/type-aliases/Transform.md)[] = `[]`

##### responseTransforms?

[`Transform`](../../../transformers/http-transformer/type-aliases/Transform.md)[] = `[]`

#### Returns

`TransformInterceptor`

## Methods

### postResponse()

> **postResponse**(`response`): `Promise`\<`void` \| `Response`\>

Applies response body transformations.

#### Parameters

##### response

`Response`

The response to transform.

#### Returns

`Promise`\<`void` \| `Response`\>

A replacement response when a transform changes the body.

#### Implementation of

[`ResponseAwareHTTPInterceptor`](../../../http-types/interfaces/ResponseAwareHTTPInterceptor.md).[`postResponse`](../../../http-types/interfaces/ResponseAwareHTTPInterceptor.md#postresponse)

***

### preRequest()

> **preRequest**(`request`): `Promise`\<`Request`\>

Applies request body transformations.

#### Parameters

##### request

`Request`

The request to transform.

#### Returns

`Promise`\<`Request`\>

A replacement request when a transform changes the body.

#### Implementation of

[`RequestAwareHTTPInterceptor`](../../../http-types/interfaces/RequestAwareHTTPInterceptor.md).[`preRequest`](../../../http-types/interfaces/RequestAwareHTTPInterceptor.md#prerequest)
