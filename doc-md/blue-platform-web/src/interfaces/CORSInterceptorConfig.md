[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / CORSInterceptorConfig

# Interface: CORSInterceptorConfig

Defined in: packages/blue-platform-web/src/cors-interceptor.ts:10

Configuration options for the CORSInterceptor.

## Properties

### allowedOrigins?

> `optional` **allowedOrigins?**: `string`[]

Defined in: packages/blue-platform-web/src/cors-interceptor.ts:14

Allowed origins. Defaults to `['*']`.

***

### allowedMethods?

> `optional` **allowedMethods?**: `string`[]

Defined in: packages/blue-platform-web/src/cors-interceptor.ts:18

Allowed HTTP methods. Defaults to `['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']`.

***

### allowedHeaders?

> `optional` **allowedHeaders?**: `string`[]

Defined in: packages/blue-platform-web/src/cors-interceptor.ts:22

Allowed headers. Defaults to `['Content-Type', 'Authorization', 'X-Requested-With']`.

***

### withCredentials?

> `optional` **withCredentials?**: `boolean`

Defined in: packages/blue-platform-web/src/cors-interceptor.ts:26

Whether to include credentials. Defaults to `false`.
