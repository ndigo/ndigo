[**@blue/http v0.0.1**](../../README.md)

***

[@blue/http](../../README.md) / [blue-http](../README.md) / RequestAwareHTTPInterceptor

# Interface: RequestAwareHTTPInterceptor

Allows a request object to be replaced before fetch executes.

## Methods

### preRequest()

> **preRequest**(`request`, `http`): `Promise`\<`void` \| `Response` \| `Request`\>

Transforms the request before it is passed to fetch.

#### Parameters

##### request

`Request`

The request to inspect or replace.

##### http

[`HTTP`](../classes/HTTP.md)

The HTTP client executing the request.

#### Returns

`Promise`\<`void` \| `Response` \| `Request`\>

A replacement request, a cached response, or `void` to keep the original.
