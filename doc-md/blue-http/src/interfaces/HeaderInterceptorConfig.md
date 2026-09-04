[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / HeaderInterceptorConfig

# Interface: HeaderInterceptorConfig

Defined in: packages/blue-http/src/interceptors/header-interceptor.ts:11

Configuration options for the HeaderInterceptor.

## Properties

### csrfToken?

> `optional` **csrfToken?**: `string`

Defined in: packages/blue-http/src/interceptors/header-interceptor.ts:15

The CSRF token to include in the X-CSRF-Token header.

***

### channelId?

> `optional` **channelId?**: `string`

Defined in: packages/blue-http/src/interceptors/header-interceptor.ts:19

The channel ID to include in the X-Channel-ID header.

***

### generateRequestId?

> `optional` **generateRequestId?**: `boolean`

Defined in: packages/blue-http/src/interceptors/header-interceptor.ts:24

Whether to generate a unique request ID for each request.

#### Default

```ts
false
```
