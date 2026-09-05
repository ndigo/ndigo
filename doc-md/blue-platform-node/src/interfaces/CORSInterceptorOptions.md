[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / CORSInterceptorOptions

# Interface: CORSInterceptorOptions

Defined in: [packages/blue-platform-node/src/cors-interceptor.ts:34](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/cors-interceptor.ts#lines-34)

Configuration for the server-side CORS interceptor.

## Properties

### allowedOrigins?

> `optional` **allowedOrigins?**: `string`[]

Defined in: [packages/blue-platform-node/src/cors-interceptor.ts:40](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/cors-interceptor.ts#lines-40)

Allowed origins (scheme://host[:port], case-insensitive). Defaults to
`[]` — no cross-origin requests are allowed unless configured. Use
`['*']` for a public API WITHOUT credentials.

***

### allowedMethods?

> `optional` **allowedMethods?**: `string`[]

Defined in: [packages/blue-platform-node/src/cors-interceptor.ts:45](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/cors-interceptor.ts#lines-45)

Allowed methods for preflight. Defaults to
`['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']`.

***

### allowedHeaders?

> `optional` **allowedHeaders?**: `string`[]

Defined in: [packages/blue-platform-node/src/cors-interceptor.ts:50](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/cors-interceptor.ts#lines-50)

Allowed request headers for preflight. Defaults to
`['Content-Type', 'Authorization', 'X-Requested-With']`.

***

### allowCredentials?

> `optional` **allowCredentials?**: `boolean`

Defined in: [packages/blue-platform-node/src/cors-interceptor.ts:56](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/cors-interceptor.ts#lines-56)

Whether credentialed requests are allowed. When `true`, `*` origins are
rejected at construction (a wildcard cannot be combined with
credentials) and the echoed origin is returned instead.

***

### exposedHeaders?

> `optional` **exposedHeaders?**: `string`[]

Defined in: [packages/blue-platform-node/src/cors-interceptor.ts:58](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/cors-interceptor.ts#lines-58)

Headers exposed to browser JS via `Access-Control-Expose-Headers`.

***

### maxAgeSeconds?

> `optional` **maxAgeSeconds?**: `number`

Defined in: [packages/blue-platform-node/src/cors-interceptor.ts:60](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/cors-interceptor.ts#lines-60)

Preflight cache lifetime in seconds (default 86400).
