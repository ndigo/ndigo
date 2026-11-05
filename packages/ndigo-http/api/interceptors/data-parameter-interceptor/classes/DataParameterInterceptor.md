[**@ndigo/http v0.0.1**](../../../README.md)

***

[@ndigo/http](../../../README.md) / [interceptors/data-parameter-interceptor](../README.md) / DataParameterInterceptor

# Class: DataParameterInterceptor

Moves `data` into the URL for bodyless methods and into `body` otherwise.

## Implements

- [`InitializationAwareHTTPInterceptor`](../../../http-types/interfaces/InitializationAwareHTTPInterceptor.md)\<[`DataParameterInit`](../type-aliases/DataParameterInit.md)\>

## Constructors

### Constructor

> **new DataParameterInterceptor**(): `DataParameterInterceptor`

#### Returns

`DataParameterInterceptor`

## Methods

### preInit()

> **preInit**(`url`, `settings`): `boolean`

module:http.DataParameterInterceptor#preInit

#### Parameters

##### url

`URL`

The requested URL.

##### settings

[`DataParameterInit`](../type-aliases/DataParameterInit.md)

The HTTP request settings, including the `data` setting.

#### Returns

`boolean`

Whether or not the http request should continue execution.

#### Implementation of

[`InitializationAwareHTTPInterceptor`](../../../http-types/interfaces/InitializationAwareHTTPInterceptor.md).[`preInit`](../../../http-types/interfaces/InitializationAwareHTTPInterceptor.md#preinit)
