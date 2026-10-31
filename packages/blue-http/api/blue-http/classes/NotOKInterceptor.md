[**@blue/http v0.0.1**](../../README.md)

***

[@blue/http](../../README.md) / [blue-http](../README.md) / NotOKInterceptor

# Class: NotOKInterceptor

Throws a [ResponseError](#) when the response status is outside 200-299.

## Implements

- [`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md)

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

[`HTTPInit`](../type-aliases/HTTPInit.md)

The HTTP request settings

#### Returns

`Promise`\<`void` \| `Response`\>

#### Implementation of

[`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md).[`postResponse`](../interfaces/ResponseAwareHTTPInterceptor.md#postresponse)
