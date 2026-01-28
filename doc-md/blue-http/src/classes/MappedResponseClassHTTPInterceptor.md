[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / MappedResponseClassHTTPInterceptor

# Class: MappedResponseClassHTTPInterceptor

Defined in: packages/blue-http/src/interceptors/response-class-interceptor.ts:135

## Implements

- [`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md)

## Constructors

### Constructor

> **new MappedResponseClassHTTPInterceptor**(`interceptor`): `MappedResponseClassHTTPInterceptor`

Defined in: packages/blue-http/src/interceptors/response-class-interceptor.ts:150

#### Parameters

##### interceptor

`any`

#### Returns

`MappedResponseClassHTTPInterceptor`

## Accessors

### interceptor

#### Get Signature

> **get** **interceptor**(): [`ResponseClassAwareHTTPInterceptor`](../type-aliases/ResponseClassAwareHTTPInterceptor.md)

Defined in: packages/blue-http/src/interceptors/response-class-interceptor.ts:146

##### Returns

[`ResponseClassAwareHTTPInterceptor`](../type-aliases/ResponseClassAwareHTTPInterceptor.md)

## Methods

### postResponse()

> **postResponse**(`response`, `settings`): `Promise`\<`void`\>

Defined in: packages/blue-http/src/interceptors/response-class-interceptor.ts:165

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
