[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / CORSInterceptor

# Class: CORSInterceptor

Defined in: [packages/blue-platform-node/src/cors-interceptor.ts:81](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/cors-interceptor.ts#lines-81)

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

Defined in: [packages/blue-platform-node/src/cors-interceptor.ts:90](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/cors-interceptor.ts#lines-90)

#### Parameters

##### options?

[`CORSInterceptorOptions`](../interfaces/CORSInterceptorOptions.md) = `{}`

#### Returns

`CORSInterceptor`

## Methods

### preHandle()

> **preHandle**(`route`, `_handler`): `Promise`\<`boolean` \| `InterceptorDenial`\>

Defined in: [packages/blue-platform-node/src/cors-interceptor.ts:113](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/cors-interceptor.ts#lines-113)

Attaches CORS headers and short-circuits preflight requests.

#### Parameters

##### route

[`Route`](#)

##### \_handler

`object` \| `undefined`

#### Returns

`Promise`\<`boolean` \| `InterceptorDenial`\>

#### Implementation of

`RouteHandlerInterceptor.preHandle`

***

### postHandle()

> **postHandle**(`route`, `_handler`, `_modelAndView`): `Promise`\<`void`\>

Defined in: [packages/blue-platform-node/src/cors-interceptor.ts:145](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/cors-interceptor.ts#lines-145)

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

### completeHandle()

> **completeHandle**(`_route`, `_handler`, `_error`): `Promise`\<`void`\>

Defined in: [packages/blue-platform-node/src/cors-interceptor.ts:159](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/cors-interceptor.ts#lines-159)

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
