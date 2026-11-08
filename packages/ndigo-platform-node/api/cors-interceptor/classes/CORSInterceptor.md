[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [cors-interceptor](../README.md) / CORSInterceptor

# Class: CORSInterceptor

A [RouteHandlerInterceptor](#) enforcing the configured CORS policy on
the Node HTTP pipeline: preflights are short-circuited with 204 and actual
responses receive the allow headers.

## Throws

when `allowedOrigins: ['*']` is combined with
  `allowCredentials: true` — the browser forbids that combination and the
  misconfiguration must fail at startup, not at request time.

## Implements

- [`RouteHandlerInterceptor`](#)

## Constructors

### Constructor

> **new CORSInterceptor**(`options?`): `CORSInterceptor`

#### Parameters

##### options?

[`CORSInterceptorOptions`](../interfaces/CORSInterceptorOptions.md) = `{}`

#### Returns

`CORSInterceptor`

## Methods

### completeHandle()

> **completeHandle**(`_route`, `_handler`, `_error`): `Promise`\<`void`\>

Completion hook is not needed for CORS.

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

> **postHandle**(`route`, `_handler`, `_modelAndView`): `Promise`\<`void`\>

Ensures the allow headers reach actual (non-preflight) responses.

#### Parameters

##### route

[`Route`](#)

The route being dispatched.

##### \_handler

`object` \| `undefined`

The route handler (unused).

##### \_modelAndView

[`ModelAndView`](#)

The produced model and view (unused).

#### Returns

`Promise`\<`void`\>

A promise that resolves once handled.

#### Implementation of

`RouteHandlerInterceptor.postHandle`

***

### preHandle()

> **preHandle**(`route`, `_handler`): `Promise`\<`boolean` \| [`InterceptorDenial`](#)\>

Attaches CORS headers and short-circuits preflight requests.

#### Parameters

##### route

[`Route`](#)

The route being dispatched.

##### \_handler

`object` \| `undefined`

The route handler (unused).

#### Returns

`Promise`\<`boolean` \| [`InterceptorDenial`](#)\>

Whether to proceed, or a preflight denial.

#### Implementation of

`RouteHandlerInterceptor.preHandle`
