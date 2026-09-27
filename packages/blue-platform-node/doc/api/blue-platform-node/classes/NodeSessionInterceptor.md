[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / NodeSessionInterceptor

# Class: NodeSessionInterceptor

Bridges the session cookie into the documented `request.session` seam:
reads the `blue-session` cookie, resolves it through a [SessionStore](#)
and populates the session bag with `principal` and `token` **before**
dispatch — so `requestSessionValue('principal')` / `@session` bindings
work for cookie-authenticated requests.

Add to your handler mapping alongside `AuthRouteGuard` (which enforces
`@authenticated`/`@authorized` and fails closed with 401/403):

```ts
mapping.interceptors.push(new NodeSessionInterceptor(sessionStore));
mapping.interceptors.push(new AuthRouteGuard(authServer, cookieTokenExtractor, 'credentials'));
```

Security contract:
- an absent, unknown or expired session leaves the bag **empty**
  (anonymous) — the guard then denies; nothing is ever fabricated;
- the interceptor only reads cookies + the store; it never sets cookies
  (login/logout own that — see `setSessionCookie`/`clearSessionCookie`);
- token values are the opaque ids issued by the store.

## Implements

- [`RouteHandlerInterceptor`](#)

## Constructors

### Constructor

> **new NodeSessionInterceptor**(`sessionStore`): `NodeSessionInterceptor`

#### Parameters

##### sessionStore

[`SessionStore`](#)

#### Returns

`NodeSessionInterceptor`

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

> **preHandle**(`route`): `Promise`\<`boolean`\>

#### Parameters

##### route

[`Route`](#)

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

`RouteHandlerInterceptor.preHandle`
