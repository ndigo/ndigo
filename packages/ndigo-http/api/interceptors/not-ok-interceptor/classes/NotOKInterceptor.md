[**@ndigo/http v0.0.1**](../../../README.md)

***

[@ndigo/http](../../../README.md) / [interceptors/not-ok-interceptor](../README.md) / NotOKInterceptor

# Class: NotOKInterceptor

Throws a [ResponseError](../../../response-error/classes/ResponseError.md) when the response status is outside 200-299.

## Implements

- [`ResponseAwareHTTPInterceptor`](../../../http-types/interfaces/ResponseAwareHTTPInterceptor.md)

## Constructors

### Constructor

> **new NotOKInterceptor**(): `NotOKInterceptor`

#### Returns

`NotOKInterceptor`

## Methods

### postResponse()

> **postResponse**(`response`, `settings`): `Promise`\<`void` \| `Response`\>

#### Parameters

##### response

`Response`

The HTTP response

##### settings

[`HTTPInit`](../../../http-types/type-aliases/HTTPInit.md)

The HTTP request settings

#### Returns

`Promise`\<`void` \| `Response`\>

#### Implementation of

[`ResponseAwareHTTPInterceptor`](../../../http-types/interfaces/ResponseAwareHTTPInterceptor.md).[`postResponse`](../../../http-types/interfaces/ResponseAwareHTTPInterceptor.md#postresponse)
