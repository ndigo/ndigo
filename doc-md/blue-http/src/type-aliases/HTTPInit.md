[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / HTTPInit

# Type Alias: HTTPInit

> **HTTPInit** = `RequestInit` & `object`

Defined in: [packages/blue-http/src/http.ts:36](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-36)

Base request settings shared by HTTP client methods and interceptor hooks.

This extends `RequestInit` with BlueJS-specific options such as `baseURL`
and query parameter merging.

## Type Declaration

### method?

> `optional` **method?**: [`HTTPMethod`](HTTPMethod.md)

### baseURL?

> `optional` **baseURL?**: `string`

### headers?

> `optional` **headers?**: `HeadersInit`

### params?

> `optional` **params?**: `URLSearchParams` \| `string`[][] \| `Record`\<`string`, `string`\> \| `string`
