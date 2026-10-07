[**@blue/http v0.0.1**](../../README.md)

***

[@blue/http](../../README.md) / [blue-http](../README.md) / CacheInterceptor

# Class: CacheInterceptor

HTTP interceptor that provides in-memory response caching.

This interceptor can return a cached response in `preRequest` to avoid
unnecessary network calls, and stores successful responses in `postResponse`.

Only 200 OK responses to GET/HEAD requests are cached, keyed by
`method:url`. Credentialed requests — those carrying an `Authorization`
or `Cookie` header — are never cached and never served from cache, so one
user's authenticated response can never leak to another user through the
shared in-memory cache. Responses that forbid shared caching (`Set-Cookie`,
`Cache-Control: private`/`no-store`/`no-cache`, `Vary: *`) are never stored,
and a stored response is only replayed when its `Vary` request headers match.

## Implements

- [`RequestAwareHTTPInterceptor`](../interfaces/RequestAwareHTTPInterceptor.md)
- [`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md)

## Constructors

### Constructor

> **new CacheInterceptor**(`config?`): `CacheInterceptor`

Creates a new cache interceptor.

#### Parameters

##### config?

[`CacheInterceptorConfig`](../interfaces/CacheInterceptorConfig.md) = `{}`

Cache interceptor configuration.

#### Returns

`CacheInterceptor`

## Methods

### postResponse()

> **postResponse**(`response`, `settings`, `request?`): `Promise`\<`void` \| `Response`\>

Stores a successful response in the cache.

#### Parameters

##### response

`Response`

The response to cache.

##### settings

[`HTTPInit`](../type-aliases/HTTPInit.md)

The request settings used for the call.

##### request?

`Request`

The final request that was sent, when the execution
chain supplies it. Request-time interceptors may attach an
`Authorization` or `Cookie` header after `settings` is frozen, so the
credential and bypass gates read the sent request rather than the
settings snapshot.

#### Returns

`Promise`\<`void` \| `Response`\>

The response.

#### Implementation of

[`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md).[`postResponse`](../interfaces/ResponseAwareHTTPInterceptor.md#postresponse)

***

### preRequest()

> **preRequest**(`request`, `http`): `Promise`\<`void` \| `Response`\>

Checks the cache for a matching response before the request is sent.

#### Parameters

##### request

`Request`

The request to check.

##### http

[`HTTP`](HTTP.md)

The HTTP client executing the request.

#### Returns

`Promise`\<`void` \| `Response`\>

A cached Response if available and not expired, otherwise void.

#### Implementation of

[`RequestAwareHTTPInterceptor`](../interfaces/RequestAwareHTTPInterceptor.md).[`preRequest`](../interfaces/RequestAwareHTTPInterceptor.md#prerequest)
