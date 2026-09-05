[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-service/src](../README.md) / MapServiceRegistry

# Class: MapServiceRegistry

Defined in: [packages/blue-service/src/service-registry.ts:34](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/service-registry.ts#lines-34)

Implementation of the ServiceRegistry using an in-memory Map.

## Implements

- [`ServiceRegistry`](../interfaces/ServiceRegistry.md)

## Constructors

### Constructor

> **new MapServiceRegistry**(): `MapServiceRegistry`

#### Returns

`MapServiceRegistry`

## Methods

### register()

> **register**(`token`, `endpoint`): `void`

Defined in: [packages/blue-service/src/service-registry.ts:43](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/service-registry.ts#lines-43)

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

#### Implementation of

[`ServiceRegistry`](../interfaces/ServiceRegistry.md).[`register`](../interfaces/ServiceRegistry.md#register)

***

### getEndpoint()

> **getEndpoint**(`token`): `string` \| `null`

Defined in: [packages/blue-service/src/service-registry.ts:53](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/service-registry.ts#lines-53)

Resolves a service token to its endpoint.

#### Parameters

##### token

`string`

The service token.

#### Returns

`string` \| `null`

The endpoint URL, or null if not found.

#### Implementation of

[`ServiceRegistry`](../interfaces/ServiceRegistry.md).[`getEndpoint`](../interfaces/ServiceRegistry.md#getendpoint)

***

### getAllEndpoints()

> **getAllEndpoints**(): `Map`\<`string`, `string`\>

Defined in: [packages/blue-service/src/service-registry.ts:62](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/service-registry.ts#lines-62)

Returns all registered service endpoints.

#### Returns

`Map`\<`string`, `string`\>

A map of tokens to endpoints.

#### Implementation of

[`ServiceRegistry`](../interfaces/ServiceRegistry.md).[`getAllEndpoints`](../interfaces/ServiceRegistry.md#getallendpoints)
