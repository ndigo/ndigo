[**@ndigo/http v0.0.1**](../../../README.md)

***

[@ndigo/http](../../../README.md) / [interceptors/response-type-interceptor](../README.md) / ResponseTypeInterceptor

# Class: ResponseTypeInterceptor

Parses response bodies into typed data and attaches the result as `data`.

## Implements

- [`InitializationAwareHTTPInterceptor`](../../../http-types/interfaces/InitializationAwareHTTPInterceptor.md)\<[`ResponseTypeInit`](../type-aliases/ResponseTypeInit.md)\>
- [`ResponseAwareHTTPInterceptor`](../../../http-types/interfaces/ResponseAwareHTTPInterceptor.md)\<[`ResponseTypeSettings`](../type-aliases/ResponseTypeSettings.md)\>

## Constructors

### Constructor

> **new ResponseTypeInterceptor**(): `ResponseTypeInterceptor`

#### Returns

`ResponseTypeInterceptor`

## Methods

### postResponse()

> **postResponse**(`response`, `settings`): `Promise`\<`void` \| `Response`\>

#### Parameters

##### response

`Response`

##### settings

[`ResponseTypeSettings`](../type-aliases/ResponseTypeSettings.md)

#### Returns

`Promise`\<`void` \| `Response`\>

#### Implementation of

[`ResponseAwareHTTPInterceptor`](../../../http-types/interfaces/ResponseAwareHTTPInterceptor.md).[`postResponse`](../../../http-types/interfaces/ResponseAwareHTTPInterceptor.md#postresponse)

***

### preInit()

> **preInit**(`url`, `settings`): `boolean`

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

[`InitializationAwareHTTPInterceptor`](../../../http-types/interfaces/InitializationAwareHTTPInterceptor.md).[`preInit`](../../../http-types/interfaces/InitializationAwareHTTPInterceptor.md#preinit)
