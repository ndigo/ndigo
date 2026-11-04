[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [ndigo-http](../README.md) / ErrorAwareHTTPInterceptor

# Interface: ErrorAwareHTTPInterceptor

Handles failures that occur while executing a request.

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

[`HTTP`](../classes/HTTP.md)

The HTTP client executing the request.

##### settings?

[`HTTPInit`](../type-aliases/HTTPInit.md)

The per-request settings object. It is created once per
`HTTP.request` call and survives the `Request` replacements performed by
other interceptors, so error-aware state (retry clones, timers) can be
keyed on an identity that outlives `new Request(...)`.

#### Returns

`Promise`\<`Response` \| `undefined`\>

A replacement response, or `undefined` to keep the failure.
