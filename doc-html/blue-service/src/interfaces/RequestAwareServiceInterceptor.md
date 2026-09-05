[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-service/src](../README.md) / RequestAwareServiceInterceptor

# Interface: RequestAwareServiceInterceptor

Defined in: [packages/blue-service/src/service.ts:72](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/service.ts#lines-72)

Handles request mutation before a service request is sent.

## Methods

### preRequest()

> **preRequest**(`request`): `Promise`\<`void` \| `Request`\>

Defined in: [packages/blue-service/src/service.ts:79](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/service.ts#lines-79)

Runs before the request is sent.

#### Parameters

##### request

`Request`

The request to inspect or replace.

#### Returns

`Promise`\<`void` \| `Request`\>

A replacement request, or void to keep the original.
