[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / RequestAwareHTTPInterceptor

# Interface: RequestAwareHTTPInterceptor

Defined in: [packages/blue-http/src/http.ts:122](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-122)

Allows a request object to be replaced before fetch executes.

## Methods

### preRequest()

> **preRequest**(`request`, `http`): `Promise`\<`void` \| `Response` \| `Request`\>

Defined in: [packages/blue-http/src/http.ts:130](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-130)

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
