[**@blue/service v0.0.1**](../README.md)

***

[@blue/service](../README.md) / ResponseAwareServiceInterceptor

# Interface: ResponseAwareServiceInterceptor\<T\>

Service-level response interceptor.

Reuses the [ResponseAwareHTTPInterceptor](#) contract; `postSuccess` is the
service-level success hook (HTTP's `postResponse`).

## Extends

- [`ResponseAwareHTTPInterceptor`](#)\<`T`\>

## Type Parameters

### T

`T` *extends* [`ServiceInit`](../type-aliases/ServiceInit.md) = [`ServiceInit`](../type-aliases/ServiceInit.md)

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

#### Inherited from

`ResponseAwareHTTPInterceptor.postResponse`

***

### postSuccess()

> **postSuccess**(`response`, `settings`): `Promise`\<`void`\>

Runs after the request succeeds.

#### Parameters

##### response

`Response`

The response returned by the service.

##### settings

`T`

The resolved service settings.

#### Returns

`Promise`\<`void`\>

A promise that resolves when post-processing completes.
