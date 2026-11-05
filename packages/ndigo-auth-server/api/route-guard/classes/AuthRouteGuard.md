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

Checks authentication and authorization metadata on the handler before
allowing execution to proceed.

#### Parameters

##### route

[`Route`](#)

##### handler

`object` \| `undefined`

#### Returns

`Promise`\<`boolean` \| [`InterceptorDenial`](#)\>

#### Implementation of

`RouteHandlerInterceptor.preHandle`
