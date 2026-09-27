[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / RateLimitInterceptor

# Class: RateLimitInterceptor

Enforces `@rateLimit` policies (SEC-6): a fixed-window budget per client
key, denied as **429 + `Retry-After`** problem documents.

- **Key**: the request's socket remote address. `X-Forwarded-For` is
  deliberately not consulted — trusted-proxy support is a Tier-2
  deferral (the gap analysis); behind a proxy all clients share the
  proxy's address, so raise the limit or land the proxy feature first.
  Requests without an address share the `'unknown'` key (fail-safe:
  they can never bypass a budget, only share one).
- **Opt-in**: handlers without `@rateLimit` metadata are untouched —
  the interceptor is a metadata gate, so registering it on the default
  mapping changes no existing route's behavior.

## Implements

- [`RouteHandlerInterceptor`](#)

## Constructors

### Constructor

> **new RateLimitInterceptor**(`limiter`): `RateLimitInterceptor`

#### Parameters

##### limiter

[`RateLimiter`](../interfaces/RateLimiter.md)

#### Returns

`RateLimitInterceptor`

## Methods

### completeHandle()

> **completeHandle**(`_route`, `_handler`, `_error`): `Promise`\<`void`\>

#### Parameters

##### \_route

[`Route`](#)

##### \_handler

`object` \| `undefined`

##### \_error

`Error` \| `null`

#### Returns

`Promise`\<`void`\>

#### Implementation of

`RouteHandlerInterceptor.completeHandle`

***

### postHandle()

> **postHandle**(`_route`, `_handler`, `_modelAndView`): `Promise`\<`void`\>

#### Parameters

##### \_route

[`Route`](#)

##### \_handler

`object` \| `undefined`

##### \_modelAndView

[`ModelAndView`](#)

#### Returns

`Promise`\<`void`\>

#### Implementation of

`RouteHandlerInterceptor.postHandle`

***

### preHandle()

> **preHandle**(`route`, `handler`): `boolean` \| [`InterceptorDenial`](#)

#### Parameters

##### route

[`Route`](#)

##### handler

`object` \| `undefined`

#### Returns

`boolean` \| [`InterceptorDenial`](#)

#### Implementation of

`RouteHandlerInterceptor.preHandle`
