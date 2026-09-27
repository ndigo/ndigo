[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / CORSInterceptor

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

> **postHandle**(`route`, `_handler`, `_modelAndView`): `Promise`\<`void`\>

Ensures the allow headers reach actual (non-preflight) responses.

#### Parameters

##### route

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

> **preHandle**(`route`, `_handler`): `Promise`\<`boolean` \| [`InterceptorDenial`](#)\>

Attaches CORS headers and short-circuits preflight requests.

#### Parameters

##### route

[`Route`](#)

##### \_handler

`object` \| `undefined`

#### Returns

`Promise`\<`boolean` \| [`InterceptorDenial`](#)\>

#### Implementation of

`RouteHandlerInterceptor.preHandle`
