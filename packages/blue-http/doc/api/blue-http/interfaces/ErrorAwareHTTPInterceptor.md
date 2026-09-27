[**@blue/http v0.0.1**](../../README.md)

***

[@blue/http](../../README.md) / [blue-http](../README.md) / ErrorAwareHTTPInterceptor

# Interface: ErrorAwareHTTPInterceptor

Handles failures that occur while executing a request.

## Methods

### postError()

> **postError**(`error`, `request`, `http`): `Promise`\<`Response` \| `undefined`\>

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

#### Returns

`Promise`\<`Response` \| `undefined`\>

A replacement response, or `undefined` to keep the failure.
