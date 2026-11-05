[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [http-types](../README.md) / ResponseAwareHTTPInterceptor

# Interface: ResponseAwareHTTPInterceptor\<T\>

Allows a response to be replaced after fetch completes.

## Type Parameters

### T

`T` *extends* [`HTTPInit`](../type-aliases/HTTPInit.md) = [`HTTPInit`](../type-aliases/HTTPInit.md)

## Methods

### postResponse()

> **postResponse**(`response`, `settings`, `request?`): `Promise`\<`void` \| `Response`\>

Transforms the response after fetch succeeds and before completion hooks run.

#### Parameters

##### response

`Response`

The response returned by fetch.

##### settings

`T`

The request settings used for the call.

##### request?

`Request`

The final request that was sent, after request-aware
interceptors ran. The execution chain always supplies it; callers that
invoke the hook directly may omit it.

#### Returns

`Promise`\<`void` \| `Response`\>

A replacement response, or `void` to keep the original.
