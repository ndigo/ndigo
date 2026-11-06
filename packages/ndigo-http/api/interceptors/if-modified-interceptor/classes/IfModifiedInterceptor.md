[**@ndigo/http v0.0.1**](../../../README.md)

***

[@ndigo/http](../../../README.md) / [interceptors/if-modified-interceptor](../README.md) / IfModifiedInterceptor

# Class: IfModifiedInterceptor

Adds conditional request headers and caches validators from prior responses.

## Implements

- [`InitializationAwareHTTPInterceptor`](../../../http-types/interfaces/InitializationAwareHTTPInterceptor.md)\<[`IfModifiedInit`](../type-aliases/IfModifiedInit.md)\>
- [`ResponseAwareHTTPInterceptor`](../../../http-types/interfaces/ResponseAwareHTTPInterceptor.md)\<[`IfModifiedInit`](../type-aliases/IfModifiedInit.md)\>

## Constructors

### Constructor

> **new IfModifiedInterceptor**(): `IfModifiedInterceptor`

#### Returns

`IfModifiedInterceptor`

## Methods

### postResponse()

> **postResponse**(`response`, `settings`): `Promise`\<`void`\>

#### Parameters

##### response

`Response`

The HTTP response.

##### settings

[`IfModifiedInit`](../type-aliases/IfModifiedInit.md)

The HTTP request settings.

#### Returns

`Promise`\<`void`\>

Whether or not the request should continue.

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

[`IfModifiedInit`](../type-aliases/IfModifiedInit.md)

The HTTP request settings, including the `ifModified` setting.

#### Returns

`boolean`

Whether or not the http request should continue execution.

#### Implementation of

[`InitializationAwareHTTPInterceptor`](../../../http-types/interfaces/InitializationAwareHTTPInterceptor.md).[`preInit`](../../../http-types/interfaces/InitializationAwareHTTPInterceptor.md#preinit)
