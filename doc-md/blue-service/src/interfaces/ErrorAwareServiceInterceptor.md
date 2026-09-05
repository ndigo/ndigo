[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-service/src](../README.md) / ErrorAwareServiceInterceptor

# Interface: ErrorAwareServiceInterceptor

Defined in: [packages/blue-service/src/service.ts:45](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/service.ts#lines-45)

Handles failure callbacks when a service request throws.

## Methods

### postFailure()

> **postFailure**(`error`, `request`): `void`

Defined in: [packages/blue-service/src/service.ts:52](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/service.ts#lines-52)

Runs after a request fails.

#### Parameters

##### error

`Error`

The error that was raised.

##### request

`Request`

The request associated with the failure.

#### Returns

`void`
