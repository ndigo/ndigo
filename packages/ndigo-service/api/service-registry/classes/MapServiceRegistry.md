[**@ndigo/service v0.0.1**](../../README.md)

***

[@ndigo/service](../../README.md) / [service-registry](../README.md) / MapServiceRegistry

# Class: MapServiceRegistry

Implementation of the ServiceRegistry using an in-memory Map.

## Implements

- [`ServiceRegistry`](../interfaces/ServiceRegistry.md)

## Constructors

### Constructor

> **new MapServiceRegistry**(): `MapServiceRegistry`

#### Returns

`MapServiceRegistry`

## Methods

### getAllEndpoints()

> **getAllEndpoints**(): `Map`\<`string`, `string`\>

Returns all registered service endpoints.

#### Returns

`Map`\<`string`, `string`\>

A map of tokens to endpoints.

#### Implementation of

[`ServiceRegistry`](../interfaces/ServiceRegistry.md).[`getAllEndpoints`](../interfaces/ServiceRegistry.md#getallendpoints)

***

### getEndpoint()

> **getEndpoint**(`token`): `string` \| `null`

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

### register()

> **register**(`token`, `endpoint`): `void`

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
