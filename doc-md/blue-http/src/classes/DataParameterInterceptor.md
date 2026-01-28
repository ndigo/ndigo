[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / DataParameterInterceptor

# Class: DataParameterInterceptor

Defined in: packages/blue-http/src/interceptors/data-parameter-interceptor.ts:65

## Implements

- [`InitializationAwareHTTPInterceptor`](../interfaces/InitializationAwareHTTPInterceptor.md)\<[`DataParameterInit`](../type-aliases/DataParameterInit.md)\>

## Constructors

### Constructor

> **new DataParameterInterceptor**(): `DataParameterInterceptor`

#### Returns

`DataParameterInterceptor`

## Methods

### preInit()

> **preInit**(`url`, `settings`): `boolean`

Defined in: packages/blue-http/src/interceptors/data-parameter-interceptor.ts:72

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

[`InitializationAwareHTTPInterceptor`](../interfaces/InitializationAwareHTTPInterceptor.md).[`preInit`](../interfaces/InitializationAwareHTTPInterceptor.md#preinit)
