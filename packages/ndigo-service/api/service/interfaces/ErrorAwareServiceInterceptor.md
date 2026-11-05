[**@ndigo/service v0.0.1**](../../README.md)

***

[@ndigo/service](../../README.md) / [service](../README.md) / ErrorAwareServiceInterceptor

# Interface: ErrorAwareServiceInterceptor

Service-level failure interceptor.

Reuses the [ErrorAwareHTTPInterceptor](#) interface; `postFailure` is the
service-level "request failed" hook.

## Extends

- [`ErrorAwareHTTPInterceptor`](#)

## Methods

### postError()

> **postError**(`error`, `request`, `http`, `settings?`): `Promise`\<`Response` \| `undefined`\>

Recovers from a transport or interceptor error.

#### Parameters

##### error

`Error`

The failure that interrupted request execution.

##### request

`Request`

The request that failed.

##### http

`HTTP`

The HTTP client executing the request.

##### settings?

`HTTPInit`

The per-request settings object. It is created once per
`HTTP.request` call and survives the `Request` replacements performed by
other interceptors, so error-aware state (retry clones, timers) can be
keyed on an identity that outlives `new Request(...)`.

#### Returns

`Promise`\<`Response` \| `undefined`\>

A replacement response, or `undefined` to keep the failure.

#### Inherited from

`ErrorAwareHTTPInterceptor.postError`

***

### postFailure()

> **postFailure**(`error`, `request`): `void`

Runs after a request fails.

#### Parameters

##### error

`Error`

The error that was raised.

##### request

`Request`

The request associated with the failure.

#### Returns

`void`
