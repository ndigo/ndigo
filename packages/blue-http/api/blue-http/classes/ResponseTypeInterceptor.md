[**@blue/http v0.0.1**](../../README.md)

***

[@blue/http](../../README.md) / [blue-http](../README.md) / ResponseTypeInterceptor

# Class: ResponseTypeInterceptor

Parses response bodies into typed data and attaches the result as `data`.

## Implements

- [`InitializationAwareHTTPInterceptor`](../interfaces/InitializationAwareHTTPInterceptor.md)\<[`ResponseTypeInit`](../type-aliases/ResponseTypeInit.md)\>
- [`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md)\<[`ResponseTypeSettings`](../type-aliases/ResponseTypeSettings.md)\>

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

[`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md).[`postResponse`](../interfaces/ResponseAwareHTTPInterceptor.md#postresponse)

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

[`InitializationAwareHTTPInterceptor`](../interfaces/InitializationAwareHTTPInterceptor.md).[`preInit`](../interfaces/InitializationAwareHTTPInterceptor.md#preinit)
