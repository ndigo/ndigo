[**@ndigo/auth-server v0.0.1**](../../README.md)

***

[@ndigo/auth-server](../../README.md) / [route-guard](../README.md) / AuthRouteGuard

# Class: AuthRouteGuard

A [RouteHandlerInterceptor](#) that enforces authentication and authorization
requirements declared via the `@authenticated` and `@authorized` decorators.

This guard integrates with [AuthServer](../../server/classes/AuthServer.md) to verify the principal's identity
and roles before allowing the request to proceed to the handler.

Validation targets one explicitly selected authentication adapter (scheme);
the guard never tries every registered adapter, which could accept tokens
issued for an unrelated scheme.

Denials fail closed with an explicit [InterceptorDenial](#): `401` for
missing/invalid credentials, `403` for insufficient roles. The platform
adapter finalizes the response, so denied requests never stay open.

## Implements

- [`RouteHandlerInterceptor`](#)

## Constructors

### Constructor

> **new AuthRouteGuard**(`authServer`, `tokenExtractor`, `adapterId`, `denialOptions?`): `AuthRouteGuard`

Creates the guard with the given token extraction and denial policy.

#### Parameters

##### authServer

[`AuthServer`](../../server/classes/AuthServer.md)

The server-side auth coordinator.

##### tokenExtractor

(`route`) => `string` \| `null`

A function to extract the auth token from the route/request.

##### adapterId

`string`

The ID of the authentication adapter to validate with.

##### denialOptions?

[`AuthGuardDenialOptions`](../interfaces/AuthGuardDenialOptions.md) = `{}`

Denial status overrides.

#### Returns

`AuthRouteGuard`

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
