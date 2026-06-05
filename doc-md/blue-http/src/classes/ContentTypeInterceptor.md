[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / ContentTypeInterceptor

# Class: ContentTypeInterceptor

Defined in: packages/blue-http/src/interceptors/content-type-interceptor.ts:24

Adds a `Content-Type` header when request settings provide one.

## Implements

module:http.InitializationAwareHTTPInterceptor

## Implements

- [`InitializationAwareHTTPInterceptor`](../interfaces/InitializationAwareHTTPInterceptor.md)\<[`ContentTypeInit`](../type-aliases/ContentTypeInit.md)\>

## Constructors

### Constructor

> **new ContentTypeInterceptor**(): `ContentTypeInterceptor`

#### Returns

`ContentTypeInterceptor`

## Methods

### preInit()

> **preInit**(`url`, `settings`): `boolean`

Defined in: packages/blue-http/src/interceptors/content-type-interceptor.ts:31

If the `contentType` setting exists, it inserts the value as an HTTP request header.

#### Parameters

##### url

`URL`

The requested URL.

##### settings

[`ContentTypeInit`](../type-aliases/ContentTypeInit.md)

The HTTP request settings, including the `contentType` setting.

#### Returns

`boolean`

Whether or not the http request should continue execution.

#### Implementation of

[`InitializationAwareHTTPInterceptor`](../interfaces/InitializationAwareHTTPInterceptor.md).[`preInit`](../interfaces/InitializationAwareHTTPInterceptor.md#preinit)
