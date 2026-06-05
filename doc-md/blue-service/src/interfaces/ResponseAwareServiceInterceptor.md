[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-service/src](../README.md) / ResponseAwareServiceInterceptor

# Interface: ResponseAwareServiceInterceptor\<T\>

Defined in: packages/blue-service/src/service.ts:81

Handles response processing after a service request succeeds.

## Type Parameters

### T

`T` *extends* [`ServiceInit`](../type-aliases/ServiceInit.md) = [`ServiceInit`](../type-aliases/ServiceInit.md)

## Methods

### postSuccess()

> **postSuccess**(`response`, `settings`): `Promise`\<`void`\>

Defined in: packages/blue-service/src/service.ts:89

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
