[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-service/src](../README.md) / CompletionAwareServiceInterceptor

# Interface: CompletionAwareServiceInterceptor

Defined in: [packages/blue-service/src/service.ts:33](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/service.ts#lines-33)

Handles completion callbacks after a service request succeeds.

## Methods

### postRequest()

> **postRequest**(`request`): `void`

Defined in: [packages/blue-service/src/service.ts:39](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/service.ts#lines-39)

Runs after the request has completed successfully.

#### Parameters

##### request

`Request`

The request that just completed.

#### Returns

`void`
