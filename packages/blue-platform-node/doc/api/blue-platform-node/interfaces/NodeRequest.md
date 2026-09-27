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

The client's socket address (`req.socket.remoteAddress`), populated
by the adapter. The rate limiter keys on this (SEC-6, Wave 3);
`X-Forwarded-For` is deliberately NOT consulted — trusted-proxy
resolution is a Tier-2 deferral (gap analysis), and trusting the
header unconditionally is a spoofing hole.

***

### session

> **session**: `Record`\<`string`, `unknown`\>

Server-side session data keyed by session variable name.

**Reserved — always empty in the built-in pipeline.** The adapter
creates requests with `session: {}` and no session provider populates
it yet; session persistence/restoration is an open contract (see the
repo's remediation plan, "Session contract"). Middleware may fill this
record before dispatch (e.g. from a signed cookie or a session store);
the `session()` argument extractor reads it.
