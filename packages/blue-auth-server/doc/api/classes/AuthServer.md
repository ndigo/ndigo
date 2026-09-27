[**@blue/auth-server v0.0.1**](../README.md)

***

[@blue/auth-server](../README.md) / AuthServer

# Class: AuthServer

Server-side authentication coordinator.

Responsible for validating incoming requests using the configured
authentication adapters and resolving the associated principal.

## Constructors

### Constructor

> **new AuthServer**(): `AuthServer`

#### Returns

`AuthServer`

## Methods

### validate()

> **validate**(`adapterId`, `token`): `Promise`\<[`Principal`](#) \| `null`\>

Validates a token using the appropriate adapter.

#### Parameters

##### adapterId

`string`

The ID of the adapter to use for validation.

##### token

`string`

The token to validate.

#### Returns

`Promise`\<[`Principal`](#) \| `null`\>

The authenticated [Principal](#), or `null` if validation fails.

***

### validateAny()

> **validateAny**(`token`, `adapterIds`): `Promise`\<[`Principal`](#) \| `null`\>

Validates a token against an explicit list of adapter IDs, returning
the first principal that verifies it.

The adapter list is explicit and fail-closed: an unregistered adapter
ID throws rather than being silently skipped, so a token can never be
accepted by a scheme that was not deliberately selected. This matches
the documented security model — `AuthRouteGuard` validates against
exactly the adapters it was configured with; validating against *every*
registered adapter is not supported.

#### Parameters

##### token

`string`

The token to validate.

##### adapterIds

`string`[]

The adapters to try, in fallback order. An unknown
  ID throws.

#### Returns

`Promise`\<[`Principal`](#) \| `null`\>

The authenticated [Principal](#), or `null` if no listed
  adapter could validate the token.
