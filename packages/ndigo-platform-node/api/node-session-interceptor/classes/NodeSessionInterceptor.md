[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [node-session-interceptor](../README.md) / NodeSessionInterceptor

# Class: NodeSessionInterceptor

Bridges the session cookie into the documented `request.session` seam:
reads the `__Host-ndigo-session` cookie, resolves it through a
[SessionStore](#) and populates the session bag with `principal` and `token` **before**
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
- a request presenting the session cookie name more than once is treated
  as unauthenticated (cookie tossing / planting fails closed);
- the interceptor only reads cookies + the store; it never sets cookies
  (login/logout own that — see `setSessionCookie`/`clearSessionCookie`);
- token values are the opaque ids issued by the store.

## Implements

- [`RouteHandlerInterceptor`](#)

## Constructors

### Constructor

> **new NodeSessionInterceptor**(`sessionStore`, `cookieName?`): `NodeSessionInterceptor`

#### Parameters

##### sessionStore

[`SessionStore`](#)

Resolves opaque session ids to records.

##### cookieName?

`string` = `SESSION_COOKIE`

The session cookie name to read (default
  [SESSION\_COOKIE](../../session-cookie/variables/SESSION_COOKIE.md)); pass the same name given to
  `setSessionCookie` when a deployment overrides it.

#### Returns

`NodeSessionInterceptor`

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

> **preHandle**(`route`): `Promise`\<`boolean`\>

Restores the session principal from the session cookie before dispatch.

#### Parameters

##### route

[`Route`](#)

The route being dispatched.

#### Returns

`Promise`\<`boolean`\>

Whether to proceed.

#### Implementation of

`RouteHandlerInterceptor.preHandle`
