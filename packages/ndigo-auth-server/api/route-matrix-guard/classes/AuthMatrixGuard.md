[**@ndigo/auth-server v0.0.1**](../../README.md)

***

[@ndigo/auth-server](../../README.md) / [route-matrix-guard](../README.md) / AuthMatrixGuard

# Class: AuthMatrixGuard

A [RouteHandlerInterceptor](#) that enforces `@authenticated` /
`@authorized` over **multiple** schemes — the multi-scheme counterpart to
[AuthRouteGuard](../../route-guard/classes/AuthRouteGuard.md), which validates a single explicit adapter id from a
single place.

It reads the same metadata keys as [AuthRouteGuard](../../route-guard/classes/AuthRouteGuard.md) (`@ndigo/auth-core`'s
`AUTH_REQUIRED_KEY`/`AUTH_ROLES_KEY`), resolves the principal through
`AuthServer.validateAny(token, […explicit scheme order…])` — the documented
ordered-fallback seam, never "try every registered adapter" — and denies
exactly like the framework guard: `401` unauthenticated, `403` insufficient
role. Both are [InterceptorDenial](#)s, so the platform finalizes them as
RFC 9457 problem documents.

The credential extraction is injected per scheme (transport-agnostic), so this
guard carries no platform dependency — the caller supplies how each scheme's
credential is read and, optionally, where the resolved principal is stored.

## Implements

- [`RouteHandlerInterceptor`](#)

## Constructors

### Constructor

> **new AuthMatrixGuard**(`authServer`, `options`): `AuthMatrixGuard`

Creates the guard with the explicit scheme list.

#### Parameters

##### authServer

[`AuthServer`](../../server/classes/AuthServer.md)

The server-side auth coordinator (adapter resolution).

##### options

[`AuthMatrixGuardOptions`](../interfaces/AuthMatrixGuardOptions.md)

The explicit scheme list and optional principal sink.

#### Returns

`AuthMatrixGuard`

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

Checks authentication and authorization metadata on the handler before
allowing execution to proceed.

#### Parameters

##### route

[`Route`](#)

The route being dispatched.

##### handler

`object` \| `undefined`

The route handler carrying decorator metadata.

#### Returns

`Promise`\<`boolean` \| [`InterceptorDenial`](#)\>

`true` to proceed, or a denial response.

#### Implementation of

`RouteHandlerInterceptor.preHandle`
