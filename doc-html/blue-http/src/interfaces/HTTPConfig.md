[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / HTTPConfig

# Interface: HTTPConfig

Defined in: [packages/blue-http/src/http.ts:49](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-49)

Configuration options for creating an HTTP client instance via [HTTP.create](../classes/HTTP.md#create).

This extends [HTTPInit](../type-aliases/HTTPInit.md) with factory-specific options that are only
relevant when constructing a client through the convenience API.

## Extends

- [`HTTPInit`](../type-aliases/HTTPInit.md)

## Properties

### baseURL?

> `optional` **baseURL?**: `string`

Defined in: [packages/blue-http/src/http.ts:38](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-38)

#### Inherited from

`HTTPInit.baseURL`

***

### params?

> `optional` **params?**: `string` \| `Record`\<`string`, `string`\> \| `URLSearchParams` \| `string`[][]

Defined in: [packages/blue-http/src/http.ts:40](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-40)

#### Inherited from

`HTTPInit.params`

***

### interceptors?

> `optional` **interceptors?**: [`HTTPInterceptor`](../type-aliases/HTTPInterceptor.md)[]

Defined in: [packages/blue-http/src/http.ts:53](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-53)

Optional HTTP interceptors to apply to all requests.

***

### requestTransforms?

> `optional` **requestTransforms?**: [`Transform`](../type-aliases/Transform.md)[]

Defined in: [packages/blue-http/src/http.ts:58](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-58)

Optional request body transforms applied in interceptor pipeline.

***

### responseTransforms?

> `optional` **responseTransforms?**: [`Transform`](../type-aliases/Transform.md)[]

Defined in: [packages/blue-http/src/http.ts:63](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-63)

Optional response body transforms applied in interceptor pipeline.

***

### fetch?

> `optional` **fetch?**: [`Fetch`](../type-aliases/Fetch.md)

Defined in: [packages/blue-http/src/http.ts:69](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-69)

Optional custom fetch implementation.
Defaults to globalThis.fetch if not provided.
