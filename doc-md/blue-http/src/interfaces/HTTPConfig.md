[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / HTTPConfig

# Interface: HTTPConfig

Defined in: packages/blue-http/src/http.ts:39

Configuration options for creating an HTTP client instance via [HTTP.create](../classes/HTTP.md#create).

This extends [HTTPInit](../type-aliases/HTTPInit.md) with factory-specific options that are only
relevant when constructing a client through the convenience API.

## Extends

- [`HTTPInit`](../type-aliases/HTTPInit.md)

## Properties

### baseURL?

> `optional` **baseURL?**: `string`

Defined in: packages/blue-http/src/http.ts:28

#### Inherited from

`HTTPInit.baseURL`

***

### params?

> `optional` **params?**: `string` \| `Record`\<`string`, `string`\> \| `URLSearchParams` \| `string`[][]

Defined in: packages/blue-http/src/http.ts:30

#### Inherited from

`HTTPInit.params`

***

### interceptors?

> `optional` **interceptors?**: [`HTTPInterceptor`](../type-aliases/HTTPInterceptor.md)[]

Defined in: packages/blue-http/src/http.ts:43

Optional HTTP interceptors to apply to all requests.

***

### requestTransforms?

> `optional` **requestTransforms?**: [`Transform`](../type-aliases/Transform.md)[]

Defined in: packages/blue-http/src/http.ts:48

Optional request body transforms applied in interceptor pipeline.

***

### responseTransforms?

> `optional` **responseTransforms?**: [`Transform`](../type-aliases/Transform.md)[]

Defined in: packages/blue-http/src/http.ts:53

Optional response body transforms applied in interceptor pipeline.

***

### fetch?

> `optional` **fetch?**: [`Fetch`](../type-aliases/Fetch.md)

Defined in: packages/blue-http/src/http.ts:59

Optional custom fetch implementation.
Defaults to globalThis.fetch if not provided.
