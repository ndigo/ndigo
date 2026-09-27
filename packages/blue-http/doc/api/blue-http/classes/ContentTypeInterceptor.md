[**@blue/http v0.0.1**](../../README.md)

***

[@blue/http](../../README.md) / [blue-http](../README.md) / ContentTypeInterceptor

# Class: ContentTypeInterceptor

Adds a `Content-Type` header when request settings provide one.

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
