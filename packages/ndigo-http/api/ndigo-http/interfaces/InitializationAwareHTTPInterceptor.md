[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [ndigo-http](../README.md) / InitializationAwareHTTPInterceptor

# Interface: InitializationAwareHTTPInterceptor\<T\>

Allows a request to be rejected before it is initialized.

## Type Parameters

### T

`T` *extends* [`HTTPInit`](../type-aliases/HTTPInit.md) = [`HTTPInit`](../type-aliases/HTTPInit.md)

## Methods

### preInit()

> **preInit**(`url`, `settings`): `boolean`

Decides whether the request should continue after URL and settings resolution.

#### Parameters

##### url

`URL`

The resolved request URL.

##### settings

`T`

The request settings being prepared.

#### Returns

`boolean`

`false` to stop the request before it is created.
