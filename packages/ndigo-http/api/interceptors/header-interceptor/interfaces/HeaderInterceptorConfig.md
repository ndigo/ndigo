[**@ndigo/http v0.0.1**](../../../README.md)

***

[@ndigo/http](../../../README.md) / [interceptors/header-interceptor](../README.md) / HeaderInterceptorConfig

# Interface: HeaderInterceptorConfig

Configuration options for the HeaderInterceptor.

## Properties

### channelId?

> `optional` **channelId?**: `string`

The channel ID to include in the X-Channel-ID header.

***

### csrfToken?

> `optional` **csrfToken?**: `string`

The CSRF token to include in the X-CSRF-Token header.

***

### generateRequestId?

> `optional` **generateRequestId?**: `boolean`

Whether to generate a unique request ID for each request.

#### Default Value

```ts
false
```
