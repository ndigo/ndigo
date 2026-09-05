[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / ResponseAwareHTTPInterceptor

# Interface: ResponseAwareHTTPInterceptor\<T\>

Defined in: [packages/blue-http/src/http.ts:136](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-136)

Allows a response to be replaced after fetch completes.

## Type Parameters

### T

`T` *extends* [`HTTPInit`](../type-aliases/HTTPInit.md) = [`HTTPInit`](../type-aliases/HTTPInit.md)

## Methods

### postResponse()

> **postResponse**(`response`, `settings`): `Promise`\<`void` \| `Response`\>

Defined in: [packages/blue-http/src/http.ts:144](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-144)

Transforms the response after fetch succeeds and before completion hooks run.

#### Parameters

##### response

`Response`

The response returned by fetch.

##### settings

`T`

The request settings used for the call.

#### Returns

`Promise`\<`void` \| `Response`\>

A replacement response, or `void` to keep the original.
