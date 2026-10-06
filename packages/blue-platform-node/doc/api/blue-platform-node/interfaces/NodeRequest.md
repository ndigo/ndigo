[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / NodeRequest

# Interface: NodeRequest

Minimal Node.js request abstraction stored in `route.attributes[NODE_REQUEST_ATTRIBUTE]`.
Middleware is responsible for populating this before the dispatcher resolves arguments.

## Properties

### body

> **body**: `Record`\<`string`, `unknown`\>

Pre-parsed request body. Use `'*'` as a body parameter name to bind the entire object.

***

### cookies

> **cookies**: `Record`\<`string`, `string`\>

Pre-parsed cookies from the `Cookie` header.

***

### headers

> **headers**: `Record`\<`string`, `string` \| `string`[] \| `undefined`\>

HTTP request headers (lower-cased names).

***

### multipart?

> `optional` **multipart?**: [`MultipartContext`](MultipartContext.md)

Parsed `multipart/form-data` parts when the request's `Content-Type` is
`multipart/form-data`. Populated by the adapter before dispatch; text
fields are also merged into [NodeRequest.body](#body). Absent for every
other content type. See `parseMultipart`.

***

### remoteAddress?

> `optional` **remoteAddress?**: `string`

The client address, populated by the adapter. Without trusted
proxies configured this is the socket address
(`req.socket.remoteAddress`); when the direct peer matches the
adapter's `trustedProxies` allowlist (AD-37), `X-Forwarded-For` is
walked from the rightmost entry and the first non-trusted valid IP
wins — the header is attacker input from any other peer and is
never consulted. The rate limiter keys on this (SEC-6, Wave 3).

***

### session

> **session**: `Record`\<`string`, `unknown`\>

Server-side session data keyed by session variable name, populated
**before dispatch** by `NodeSessionInterceptor` when the request
carries a valid `blue-session` cookie: `principal` (the resolved
`@blue/auth-core` principal) and `token` (the opaque session id).
An absent, unknown, or expired session leaves the bag **empty**
(anonymous) — nothing is ever fabricated; `AuthRouteGuard` then
denies protected routes (401/403).

Middleware may also fill this record before dispatch (e.g. from a
signed cookie or another session store); the `session()` argument
extractor (`requestSessionValue`) reads it.
