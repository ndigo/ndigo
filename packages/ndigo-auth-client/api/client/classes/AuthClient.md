[**@ndigo/auth-client v0.0.1**](../../README.md)

***

[@ndigo/auth-client](../../README.md) / [client](../README.md) / AuthClient

# Class: AuthClient

Client-side authentication manager.

Responsible for managing the authentication state, handling token storage,
and coordinating with authentication adapters for client-side flows
(e.g., redirects, callbacks, token storage).

## Constructors

### Constructor

> **new AuthClient**(): `AuthClient`

#### Returns

`AuthClient`

## Accessors

### isAuthenticated

#### Get Signature

> **get** **isAuthenticated**(): `boolean`

##### Returns

`boolean`

***

### principal

#### Get Signature

> **get** **principal**(): [`Principal`](../../index/interfaces/Principal.md) \| `null`

##### Returns

[`Principal`](../../index/interfaces/Principal.md) \| `null`

***

### state

#### Get Signature

> **get** **state**(): [`AuthenticationState`](../../index/interfaces/AuthenticationState.md)

##### Returns

[`AuthenticationState`](../../index/interfaces/AuthenticationState.md)

## Methods

### authenticate()

> **authenticate**(`adapterId`, `credentials`): `Promise`\<[`AuthResult`](../../index/interfaces/AuthResult.md)\>

Authenticates the user using the specified adapter.

#### Parameters

##### adapterId

`string`

The ID of the adapter to use.

##### credentials

`unknown`

The credentials to authenticate with.

#### Returns

`Promise`\<[`AuthResult`](../../index/interfaces/AuthResult.md)\>

The [AuthResult](../../index/interfaces/AuthResult.md) containing the principal and token.

***

### init()

> **init**(`adapterId`, `token`): `Promise`\<`void`\>

Initializes the authentication state from a stored token.

#### Parameters

##### adapterId

`string`

The ID of the adapter to use for initial validation.

##### token

`string`

The token to initialize with.

#### Returns

`Promise`\<`void`\>

***

### logout()

> **logout**(`adapterId`): `Promise`\<`void`\>

Logs out the user and clears the authentication state.

#### Parameters

##### adapterId

`string`

The ID of the adapter to use for logout.

#### Returns

`Promise`\<`void`\>

***

### refresh()

> **refresh**(`adapterId`): `Promise`\<[`AuthResult`](../../index/interfaces/AuthResult.md)\>

Refreshes the current session.

Presents the most recent refresh token captured from a refresh-capable
adapter (`AuthResult.refreshToken`), falling back to the session token
when none was issued. A rotated refresh token from the result replaces
the stored one; results without one leave it current.

#### Parameters

##### adapterId

`string`

The ID of the adapter to use for refresh.

#### Returns

`Promise`\<[`AuthResult`](../../index/interfaces/AuthResult.md)\>

The updated [AuthResult](../../index/interfaces/AuthResult.md).

***

### validate()

> **validate**(`adapterId`): `Promise`\<[`Principal`](../../index/interfaces/Principal.md) \| `null`\>

Validates the current token and updates the authentication state.

#### Parameters

##### adapterId

`string`

The ID of the adapter to use for validation.

#### Returns

`Promise`\<[`Principal`](../../index/interfaces/Principal.md) \| `null`\>

The validated [Principal](../../index/interfaces/Principal.md), or null if validation fails.
