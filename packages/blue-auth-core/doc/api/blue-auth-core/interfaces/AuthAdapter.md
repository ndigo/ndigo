[**@blue/auth-core v0.0.1**](../../README.md)

***

[@blue/auth-core](../../README.md) / [blue-auth-core](../README.md) / AuthAdapter

# Interface: AuthAdapter

A standardized adapter for authentication providers.

Implementations of this interface handle the protocol-specific logic
(e.g., OAuth2, OIDC, SAML) to verify identities and manage sessions.

## Properties

### id

> `readonly` **id**: `string`

The unique identifier for this adapter (e.g., 'oidc', 'saml').

## Methods

### authenticate()

> **authenticate**(`credentials`): `Promise`\<[`AuthResult`](AuthResult.md)\>

Performs the primary authentication flow.

#### Parameters

##### credentials

`unknown`

The credentials provided by the user. Adapters
narrow this opaque value to their protocol-specific credential shape.

#### Returns

`Promise`\<[`AuthResult`](AuthResult.md)\>

An [AuthResult](AuthResult.md) containing the principal and session token.

***

### logout()

> **logout**(`token`): `Promise`\<`void`\>

Terminates the session associated with the given token.

#### Parameters

##### token

`string`

The token to invalidate.

#### Returns

`Promise`\<`void`\>

***

### refresh()

> **refresh**(`token`): `Promise`\<[`AuthResult`](AuthResult.md)\>

Refreshes an existing session token.

#### Parameters

##### token

`string`

The token to refresh.

#### Returns

`Promise`\<[`AuthResult`](AuthResult.md)\>

A new [AuthResult](AuthResult.md) with the updated token.

***

### validate()

> **validate**(`token`): `Promise`\<[`Principal`](Principal.md) \| `null`\>

Validates a session token and returns the associated principal.

#### Parameters

##### token

`string`

The session or access token to validate.

#### Returns

`Promise`\<[`Principal`](Principal.md) \| `null`\>

The authenticated [Principal](Principal.md), or `null` if the token is invalid or expired.
