[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-service/src](../README.md) / InitializationAwareServiceInterceptor

# Interface: InitializationAwareServiceInterceptor\<T\>

Defined in: [packages/blue-service/src/service.ts:58](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/service.ts#lines-58)

Handles pre-initialization checks before a service request is created.

## Type Parameters

### T

`T` *extends* [`ServiceInit`](../type-aliases/ServiceInit.md) = [`ServiceInit`](../type-aliases/ServiceInit.md)

## Methods

### preInit()

> **preInit**(`url`, `settings`): `boolean`

Defined in: [packages/blue-service/src/service.ts:66](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/service.ts#lines-66)

Decides whether the interceptor should participate in the request.

#### Parameters

##### url

`URL`

The request URL being initialized.

##### settings

`T`

The resolved service settings.

#### Returns

`boolean`

`true` when the interceptor should run.
