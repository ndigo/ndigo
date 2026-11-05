[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [security-headers-interceptor](../README.md) / SecurityHeadersInterceptor

# Class: SecurityHeadersInterceptor

A [RouteHandlerInterceptor](#) that attaches the security-header set on
every HTTP response (AD-25): Helmet middlewares built at construction and
invoked against the route's `ServerResponse` in `preHandle`.

- **Default-on via `NodeAutoConfiguration` (the mapping prepends a default
instance, so every Node app gets the set without wiring) — the CORS
short-circuit and CSRF denial run after it, and the fallback chain covers
unmatched routes (404s and errors included).
- **CSP `connect-src` defaults to `'self'`** (SEC-4/D1), which covers
  same-origin WebSocket streams under CSP3. A socket server on a different
  host opts in by widening `directives['connect-src']` to
  `wss://<ws-host>` via the Helmet `contentSecurityPolicy` option —
  explicitly, never bare `ws:`/`wss:`.
- Never denies: always returns `true`; skips when no response is attached
  (socket upgrades) or headers were already flushed.
- Error handling: middleware invocation failures propagate synchronously
  and surface through the pipeline's normal error path; header-writing is
  last-write-wins with app-level `setHeader` calls that run later.

## Implements

- [`RouteHandlerInterceptor`](#)

## Constructors

### Constructor

> **new SecurityHeadersInterceptor**(`options?`): `SecurityHeadersInterceptor`

#### Parameters

##### options?

[`SecurityHeadersInterceptorOptions`](../interfaces/SecurityHeadersInterceptorOptions.md) = `{}`

Header configuration (see
  [SecurityHeadersInterceptorOptions](../interfaces/SecurityHeadersInterceptorOptions.md)).

#### Returns

`SecurityHeadersInterceptor`

## Methods

### completeHandle()

> **completeHandle**(): `void` \| `Promise`\<`void`\>

#### Returns

`void` \| `Promise`\<`void`\>

#### Implementation of

`RouteHandlerInterceptor.completeHandle`

***

### postHandle()

> **postHandle**(): `void` \| `Promise`\<`void`\>

#### Returns

`void` \| `Promise`\<`void`\>

#### Implementation of

`RouteHandlerInterceptor.postHandle`

***

### preHandle()

> **preHandle**(`route`, `_handler`): `Promise`\<`PreHandleOutcome`\>

Attaches the configured headers to the route's response (CORS-interceptor
idiom: response resolved from the route attributes). Skips when no
response is attached or the head was already flushed (e.g. socket
upgrades). Always allows the request through.

#### Parameters

##### route

[`Route`](#)

##### \_handler

`object` \| `undefined`

#### Returns

`Promise`\<`PreHandleOutcome`\>

#### Implementation of

`RouteHandlerInterceptor.preHandle`
