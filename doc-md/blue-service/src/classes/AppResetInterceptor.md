[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-service/src](../README.md) / AppResetInterceptor

# Class: AppResetInterceptor

Defined in: packages/blue-http/lib/interceptors/app-reset-interceptor.d.ts:31

HTTP interceptor that reloads the page when a matching reset response is received.

This interceptor implements the ResponseAwareHTTPInterceptor interface and
triggers a page reload when:
- The response has the configured appResetHeader header
- The response status matches appResetCode (default 205) or 303
- The hostname is not 'localhost'

## Implements

## Implements

- `ResponseAwareHTTPInterceptor`\<[`AppResetInit`](../type-aliases/AppResetInit.md)\>

## Constructors

### Constructor

> **new AppResetInterceptor**(`reloadCallback?`): `AppResetInterceptor`

Defined in: packages/blue-http/lib/interceptors/app-reset-interceptor.d.ts:38

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

Defined in: packages/blue-http/lib/interceptors/app-reset-interceptor.d.ts:46

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

`ResponseAwareHTTPInterceptor.postResponse`
