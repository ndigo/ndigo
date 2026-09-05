[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / HeaderInterceptor

# Class: HeaderInterceptor

Defined in: [packages/blue-http/src/interceptors/header-interceptor.ts:35](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/interceptors/header-interceptor.ts#lines-35)

HTTP interceptor that adds standard headers to outgoing requests.

This interceptor implements the RequestAwareHTTPInterceptor interface and
adds CSRF tokens, channel IDs, and request IDs to the request headers.

## Implements

- [`RequestAwareHTTPInterceptor`](../interfaces/RequestAwareHTTPInterceptor.md)

## Constructors

### Constructor

> **new HeaderInterceptor**(`config?`): `HeaderInterceptor`

Defined in: [packages/blue-http/src/interceptors/header-interceptor.ts:43](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/interceptors/header-interceptor.ts#lines-43)

Creates a new header interceptor.

#### Parameters

##### config?

[`HeaderInterceptorConfig`](../interfaces/HeaderInterceptorConfig.md) = `{}`

Header interceptor configuration.

#### Returns

`HeaderInterceptor`

## Methods

### preRequest()

> **preRequest**(`request`, `http`): `Promise`\<`Request`\>

Defined in: [packages/blue-http/src/interceptors/header-interceptor.ts:54](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/interceptors/header-interceptor.ts#lines-54)

Adds configured headers to the request before it is sent.

#### Parameters

##### request

`Request`

The request to modify.

##### http

[`HTTP`](HTTP.md)

The HTTP client executing the request.

#### Returns

`Promise`\<`Request`\>

A new Request object with the updated headers.

#### Implementation of

[`RequestAwareHTTPInterceptor`](../interfaces/RequestAwareHTTPInterceptor.md).[`preRequest`](../interfaces/RequestAwareHTTPInterceptor.md#prerequest)
