[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [rate-limit-interceptor](../README.md) / RateLimitInterceptor

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

No-op completion hook.

#### Parameters

##### \_route

[`Route`](#)

The dispatched route.

##### \_handler

`object` \| `undefined`

The handler that ran.

##### \_error

`Error` \| `null`

The error raised, if any.

#### Returns

`Promise`\<`void`\>

A promise that resolves immediately.

#### Implementation of

`RouteHandlerInterceptor.completeHandle`

***

### postHandle()

> **postHandle**(`_route`, `_handler`, `_modelAndView`): `Promise`\<`void`\>

No-op post-handle hook.

#### Parameters

##### \_route

[`Route`](#)

The dispatched route.

##### \_handler

`object` \| `undefined`

The handler that ran.

##### \_modelAndView

[`ModelAndView`](#)

The produced model and view.

#### Returns

`Promise`\<`void`\>

A promise that resolves immediately.

#### Implementation of

`RouteHandlerInterceptor.postHandle`

***

### preHandle()

> **preHandle**(`route`, `handler`): `Promise`\<`boolean` \| [`InterceptorDenial`](#)\>

Enforces the route's rate-limit policy.

#### Parameters

##### route

[`Route`](#)

The route being dispatched.

##### handler

`object` \| `undefined`

The route handler carrying `@rateLimit` metadata.

#### Returns

`Promise`\<`boolean` \| [`InterceptorDenial`](#)\>

Whether to proceed, or a 429 denial.

#### Implementation of

`RouteHandlerInterceptor.preHandle`
