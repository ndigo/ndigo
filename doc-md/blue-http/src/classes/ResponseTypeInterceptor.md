[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / ResponseTypeInterceptor

# Class: ResponseTypeInterceptor

Defined in: packages/blue-http/src/interceptors/response-type-interceptor.ts:73

## Implements

- [`InitializationAwareHTTPInterceptor`](../interfaces/InitializationAwareHTTPInterceptor.md)\<[`ResponseTypeInit`](../type-aliases/ResponseTypeInit.md)\>
- [`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md)\<[`ResponseTypeSettings`](../type-aliases/ResponseTypeSettings.md)\>

## Constructors

### Constructor

> **new ResponseTypeInterceptor**(): `ResponseTypeInterceptor`

#### Returns

`ResponseTypeInterceptor`

## Methods

### preInit()

> **preInit**(`url`, `settings`): `boolean`

Defined in: packages/blue-http/src/interceptors/response-type-interceptor.ts:81

#### Parameters

##### url

`URL`

The requested URL.

##### settings

[`ResponseTypeInit`](../type-aliases/ResponseTypeInit.md)

The HTTP request settings, including the `responseType` setting.

#### Returns

`boolean`

Whether or not the http request should continue execution.

#### Implementation of

[`InitializationAwareHTTPInterceptor`](../interfaces/InitializationAwareHTTPInterceptor.md).[`preInit`](../interfaces/InitializationAwareHTTPInterceptor.md#preinit)

***

### postResponse()

> **postResponse**(`response`, `settings`): `Promise`\<`void`\>

Defined in: packages/blue-http/src/interceptors/response-type-interceptor.ts:116

#### Parameters

##### response

`Response`

##### settings

[`ResponseTypeSettings`](../type-aliases/ResponseTypeSettings.md)

#### Returns

`Promise`\<`void`\>

#### Async

*

#### Implementation of

[`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md).[`postResponse`](../interfaces/ResponseAwareHTTPInterceptor.md#postresponse)
