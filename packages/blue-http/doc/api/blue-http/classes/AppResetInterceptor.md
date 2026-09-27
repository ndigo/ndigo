[**@blue/http v0.0.1**](../../README.md)

***

[@blue/http](../../README.md) / [blue-http](../README.md) / AppResetInterceptor

# Class: AppResetInterceptor

HTTP interceptor that reloads the page when a matching reset response is received.

This interceptor implements the ResponseAwareHTTPInterceptor interface and
triggers a page reload when:
- The response has the configured appResetHeader header
- The response status matches appResetCode (default 205) or 303
- The hostname is not 'localhost'

## Implements

- [`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md)\<[`AppResetInit`](../type-aliases/AppResetInit.md)\>

## Constructors

### Constructor

> **new AppResetInterceptor**(`reloadCallback?`): `AppResetInterceptor`

Creates a new app reset interceptor.

#### Parameters

##### reloadCallback?

() => `void`

A callback to trigger page reload. Defaults to a no-op.

#### Returns

`AppResetInterceptor`

## Methods

### postResponse()

> **postResponse**(`response`, `settings`): `Promise`\<`void` \| `Response`\>

Reloads the current page when a matching reset response is received.

#### Parameters

##### response

`Response`

Response returned by the HTTP request.

##### settings

[`AppResetInit`](../type-aliases/AppResetInit.md)

Interceptor settings used to match the reset signal.

#### Returns

`Promise`\<`void` \| `Response`\>

A promise that resolves once post-processing completes.

#### Implementation of

[`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md).[`postResponse`](../interfaces/ResponseAwareHTTPInterceptor.md#postresponse)
