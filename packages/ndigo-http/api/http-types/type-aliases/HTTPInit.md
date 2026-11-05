[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [http-types](../README.md) / HTTPInit

# Type Alias: HTTPInit

> **HTTPInit** = `RequestInit` & `object`

Base request settings shared by HTTP client methods and interceptor hooks.

This extends `RequestInit` with Ndigo-specific options such as `baseURL`
and query parameter merging.

## Type Declaration

### baseURL?

> `optional` **baseURL?**: `string`

### headers?

> `optional` **headers?**: `HeadersInit`

### method?

> `optional` **method?**: [`HTTPMethod`](HTTPMethod.md)

### params?

> `optional` **params?**: `URLSearchParams` \| `string`[][] \| `Record`\<`string`, `string`\> \| `string`
