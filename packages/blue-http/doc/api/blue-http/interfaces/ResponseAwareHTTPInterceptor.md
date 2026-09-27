[**@blue/http v0.0.1**](../../README.md)

***

[@blue/http](../../README.md) / [blue-http](../README.md) / ResponseAwareHTTPInterceptor

# Interface: ResponseAwareHTTPInterceptor\<T\>

Allows a response to be replaced after fetch completes.

## Type Parameters

### T

`T` *extends* [`HTTPInit`](../type-aliases/HTTPInit.md) = [`HTTPInit`](../type-aliases/HTTPInit.md)

## Methods

### postResponse()

> **postResponse**(`response`, `settings`): `Promise`\<`void` \| `Response`\>

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
