[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / IfModifiedInterceptor

# Class: IfModifiedInterceptor

Defined in: packages/blue-http/src/interceptors/if-modified-interceptor.ts:24

Adds conditional request headers and caches validators from prior responses.

## Implements

module:http.InitializationAwareHTTPInterceptor

## Implements

module:http.ResponseAwareHTTPInterceptor

## Implements

- [`InitializationAwareHTTPInterceptor`](../interfaces/InitializationAwareHTTPInterceptor.md)\<[`IfModifiedInit`](../type-aliases/IfModifiedInit.md)\>
- [`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md)\<[`IfModifiedInit`](../type-aliases/IfModifiedInit.md)\>

## Constructors

### Constructor

> **new IfModifiedInterceptor**(): `IfModifiedInterceptor`

Defined in: packages/blue-http/src/interceptors/if-modified-interceptor.ts:30

#### Returns

`IfModifiedInterceptor`

## Methods

### preInit()

> **preInit**(`url`, `settings`): `boolean`

Defined in: packages/blue-http/src/interceptors/if-modified-interceptor.ts:40

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

[`InitializationAwareHTTPInterceptor`](../interfaces/InitializationAwareHTTPInterceptor.md).[`preInit`](../interfaces/InitializationAwareHTTPInterceptor.md#preinit)

***

### postResponse()

> **postResponse**(`response`, `settings`): `Promise`\<`void`\>

Defined in: packages/blue-http/src/interceptors/if-modified-interceptor.ts:57

#### Parameters

##### response

`Response`

##### settings

[`IfModifiedInit`](../type-aliases/IfModifiedInit.md)

#### Returns

`Promise`\<`void`\>

#### Async

#### Implementation of

[`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md).[`postResponse`](../interfaces/ResponseAwareHTTPInterceptor.md#postresponse)
