[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-service/src](../README.md) / ServiceRegistry

# Interface: ServiceRegistry

Defined in: [packages/blue-service/src/service-registry.ts:8](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/service-registry.ts#lines-8)

Interface for a service registry that maps service tokens to endpoints.

## Methods

### register()

> **register**(`token`, `endpoint`): `void`

Defined in: [packages/blue-service/src/service-registry.ts:15](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/service-registry.ts#lines-15)

Registers a service token with a specific endpoint.

#### Parameters

##### token

`string`

The unique token for the service.

##### endpoint

`string`

The endpoint URL for the service.

#### Returns

`void`

***

### getEndpoint()

> **getEndpoint**(`token`): `string` \| `null`

Defined in: [packages/blue-service/src/service-registry.ts:22](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/service-registry.ts#lines-22)

Resolves a service token to its endpoint.

#### Parameters

##### token

`string`

The service token.

#### Returns

`string` \| `null`

The endpoint URL, or null if not found.

***

### getAllEndpoints()

> **getAllEndpoints**(): `Map`\<`string`, `string`\>

Defined in: [packages/blue-service/src/service-registry.ts:28](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/service-registry.ts#lines-28)

Returns all registered service endpoints.

#### Returns

`Map`\<`string`, `string`\>

A map of tokens to endpoints.
