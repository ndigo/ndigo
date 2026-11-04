[**@ndigo/service v0.0.1**](../README.md)

***

[@ndigo/service](../README.md) / ServiceRegistry

# Interface: ServiceRegistry

## Methods

### getAllEndpoints()

> **getAllEndpoints**(): `Map`\<`string`, `string`\>

Returns all registered service endpoints.

#### Returns

`Map`\<`string`, `string`\>

A map of tokens to endpoints.

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
