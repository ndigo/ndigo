[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / InitializationAwareHTTPInterceptor

# Interface: InitializationAwareHTTPInterceptor\<T\>

Defined in: [packages/blue-http/src/http.ts:108](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-108)

Allows a request to be rejected before it is initialized.

## Type Parameters

### T

`T` *extends* [`HTTPInit`](../type-aliases/HTTPInit.md) = [`HTTPInit`](../type-aliases/HTTPInit.md)

## Methods

### preInit()

> **preInit**(`url`, `settings`): `boolean`

Defined in: [packages/blue-http/src/http.ts:116](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-116)

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
