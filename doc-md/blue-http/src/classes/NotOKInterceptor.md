[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / NotOKInterceptor

# Class: NotOKInterceptor

Defined in: packages/blue-http/src/interceptors/not-ok-interceptor.ts:11

## Implements

- [`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md)

## Constructors

### Constructor

> **new NotOKInterceptor**(): `NotOKInterceptor`

#### Returns

`NotOKInterceptor`

## Methods

### postResponse()

> **postResponse**(`response`, `settings`): `Promise`\<`void`\>

Defined in: packages/blue-http/src/interceptors/not-ok-interceptor.ts:18

#### Parameters

##### response

`Response`

The HTTP response

##### settings

[`HTTPInit`](../type-aliases/HTTPInit.md)

The HTTP request settings

#### Returns

`Promise`\<`void`\>

#### Async

*

#### Implementation of

[`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md).[`postResponse`](../interfaces/ResponseAwareHTTPInterceptor.md#postresponse)
