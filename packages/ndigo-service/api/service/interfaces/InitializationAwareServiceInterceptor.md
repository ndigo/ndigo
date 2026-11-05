[**@ndigo/service v0.0.1**](../../README.md)

***

[@ndigo/service](../../README.md) / [service](../README.md) / InitializationAwareServiceInterceptor

# Interface: InitializationAwareServiceInterceptor\<T\>

Service-level pre-initialization interceptor.

Reuses the [InitializationAwareHTTPInterceptor](#) contract (settings are
`ServiceInit`, which extends `HTTPInit`).

## Extends

- [`InitializationAwareHTTPInterceptor`](#)\<`T`\>

## Type Parameters

### T

`T` *extends* [`ServiceInit`](../type-aliases/ServiceInit.md) = [`ServiceInit`](../type-aliases/ServiceInit.md)

## Methods

### preInit()

> **preInit**(`url`, `settings`): `boolean`

Decides whether the interceptor should participate in the request.

#### Parameters

##### url

`URL`

The request URL being initialized.

##### settings

`T`

The resolved service settings.

#### Returns

`boolean`

`true` when the interceptor should run.

#### Overrides

`InitializationAwareHTTPInterceptor.preInit`
