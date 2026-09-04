[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / ErrorAwareHTTPInterceptor

# Interface: ErrorAwareHTTPInterceptor

Defined in: packages/blue-http/src/http.ts:83

Handles failures that occur while executing a request.

## Methods

### postError()

> **postError**(`error`, `request`, `http`): `Promise`\<`Response` \| `undefined`\>

Defined in: packages/blue-http/src/http.ts:92

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
