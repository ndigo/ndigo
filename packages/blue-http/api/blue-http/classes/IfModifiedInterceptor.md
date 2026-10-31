[**@blue/http v0.0.1**](../../README.md)

***

[@blue/http](../../README.md) / [blue-http](../README.md) / IfModifiedInterceptor

# Class: IfModifiedInterceptor

Adds conditional request headers and caches validators from prior responses.

## Implements

- [`InitializationAwareHTTPInterceptor`](../interfaces/InitializationAwareHTTPInterceptor.md)\<[`IfModifiedInit`](../type-aliases/IfModifiedInit.md)\>
- [`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md)\<[`IfModifiedInit`](../type-aliases/IfModifiedInit.md)\>

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

##### settings

[`IfModifiedInit`](../type-aliases/IfModifiedInit.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md).[`postResponse`](../interfaces/ResponseAwareHTTPInterceptor.md#postresponse)

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

[`InitializationAwareHTTPInterceptor`](../interfaces/InitializationAwareHTTPInterceptor.md).[`preInit`](../interfaces/InitializationAwareHTTPInterceptor.md#preinit)
