[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / MappedResponseCodeHTTPInterceptor

# Class: MappedResponseCodeHTTPInterceptor

Defined in: packages/blue-http/src/interceptors/response-code-interceptor.ts:22

## Implements

- [`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md)

## Constructors

### Constructor

> **new MappedResponseCodeHTTPInterceptor**(`interceptor`): `MappedResponseCodeHTTPInterceptor`

Defined in: packages/blue-http/src/interceptors/response-code-interceptor.ts:32

#### Parameters

##### interceptor

[`ResponseCodeAwareHTTPInterceptor`](../interfaces/ResponseCodeAwareHTTPInterceptor.md)

#### Returns

`MappedResponseCodeHTTPInterceptor`

## Accessors

### interceptor

#### Get Signature

> **get** **interceptor**(): [`ResponseCodeAwareHTTPInterceptor`](../interfaces/ResponseCodeAwareHTTPInterceptor.md)

Defined in: packages/blue-http/src/interceptors/response-code-interceptor.ts:28

##### Returns

[`ResponseCodeAwareHTTPInterceptor`](../interfaces/ResponseCodeAwareHTTPInterceptor.md)

## Methods

### postResponse()

> **postResponse**(`response`, `settings`): `Promise`\<`void`\>

Defined in: packages/blue-http/src/interceptors/response-code-interceptor.ts:42

#### Parameters

##### response

`Response`

##### settings

[`HTTPInit`](../type-aliases/HTTPInit.md)

#### Returns

`Promise`\<`void`\>

#### Async

*

#### Implementation of

[`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md).[`postResponse`](../interfaces/ResponseAwareHTTPInterceptor.md#postresponse)
