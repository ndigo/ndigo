[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [ndigo-platform-node](../README.md) / RateLimitInterceptor

# Class: RateLimitInterceptor

Enforces `@rateLimit` policies (SEC-6): a fixed-window budget per client
key, denied as **429 + `Retry-After`** problem documents.

- **Key**: `NodeRequest.remoteAddress` — the socket peer unless the
  direct connection matches the adapter's `trustedProxies` allowlist
  (`NDIGO_TRUSTED_PROXIES` env; see node-request.ts:35 and guide 11
  §9): then `X-Forwarded-For` is walked rightmost-first and the first
  non-trusted valid IP wins, so spoofed leftmost values can never win;
  with no trusted proxies configured the socket peer is used.
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

[`RateLimiter`](#)

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

> **preHandle**(`route`, `handler`): `Promise`\<`boolean` \| [`InterceptorDenial`](#)\>

#### Parameters

##### route

[`Route`](#)

##### handler

`object` \| `undefined`

#### Returns

`Promise`\<`boolean` \| [`InterceptorDenial`](#)\>

#### Implementation of

`RouteHandlerInterceptor.preHandle`
