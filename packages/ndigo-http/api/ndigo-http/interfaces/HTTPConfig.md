[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [ndigo-http](../README.md) / HTTPConfig

# Interface: HTTPConfig

Configuration options for creating an HTTP client instance via [HTTP.create](../classes/HTTP.md#create).

This extends [HTTPInit](../type-aliases/HTTPInit.md) with factory-specific options that are only
relevant when constructing a client through the convenience API.

## Extends

- [`HTTPInit`](../type-aliases/HTTPInit.md)

## Properties

### baseURL?

> `optional` **baseURL?**: `string`

#### Inherited from

`HTTPInit.baseURL`

***

### fetch?

> `optional` **fetch?**: [`Fetch`](../type-aliases/Fetch.md)

Optional custom fetch implementation.
Defaults to globalThis.fetch if not provided.

***

### interceptors?

> `optional` **interceptors?**: [`HTTPInterceptor`](../type-aliases/HTTPInterceptor.md)[]

Optional HTTP interceptors to apply to all requests.

***

### params?

> `optional` **params?**: `string` \| `Record`\<`string`, `string`\> \| `URLSearchParams` \| `string`[][]

#### Inherited from

`HTTPInit.params`

***

### requestTransforms?

> `optional` **requestTransforms?**: [`Transform`](../type-aliases/Transform.md)[]

Optional request body transforms applied in interceptor pipeline.

***

### responseTransforms?

> `optional` **responseTransforms?**: [`Transform`](../type-aliases/Transform.md)[]

Optional response body transforms applied in interceptor pipeline.
