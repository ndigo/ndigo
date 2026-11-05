[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [http-types](../README.md) / RequestAwareHTTPInterceptor

# Interface: RequestAwareHTTPInterceptor

Allows a request object to be replaced before fetch executes.

## Methods

### preRequest()

> **preRequest**(`request`, `http`, `settings?`): `Promise`\<`void` \| `Request` \| `Response`\>

Transforms the request before it is passed to fetch.

#### Parameters

##### request

`Request`

The request to inspect or replace.

##### http

[`HTTP`](../../http-client/classes/HTTP.md)

The HTTP client executing the request.

##### settings?

[`HTTPInit`](../type-aliases/HTTPInit.md)

The per-request settings object. Unlike the `Request`,
it is not replaced by later interceptors, so state that must survive a
request rebuild (e.g. an undisturbed body clone for retries) is keyed on
it.

#### Returns

`Promise`\<`void` \| `Request` \| `Response`\>

A replacement request, a cached response, or `void` to keep the original.
