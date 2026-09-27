[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / CORSInterceptorOptions

# Interface: CORSInterceptorOptions

Configuration for the server-side CORS interceptor.

## Properties

### allowCredentials?

> `optional` **allowCredentials?**: `boolean`

Whether credentialed requests are allowed. When `true`, `*` origins are
rejected at construction (a wildcard cannot be combined with
credentials) and the echoed origin is returned instead.

***

### allowedHeaders?

> `optional` **allowedHeaders?**: `string`[]

Allowed request headers for preflight. Defaults to
`['Content-Type', 'Authorization', 'X-Requested-With']`.

***

### allowedMethods?

> `optional` **allowedMethods?**: `string`[]

Allowed methods for preflight. Defaults to
`['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']`.

***

### allowedOrigins?

> `optional` **allowedOrigins?**: `string`[]

Allowed origins (scheme://host[:port], case-insensitive). Defaults to
`[]` — no cross-origin requests are allowed unless configured. Use
`['*']` for a public API WITHOUT credentials.

***

### exposedHeaders?

> `optional` **exposedHeaders?**: `string`[]

Headers exposed to browser JS via `Access-Control-Expose-Headers`.

***

### maxAgeSeconds?

> `optional` **maxAgeSeconds?**: `number`

Preflight cache lifetime in seconds (default 86400).
