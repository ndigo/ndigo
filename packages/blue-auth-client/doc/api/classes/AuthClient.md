[**@blue/auth-client v0.0.1**](../README.md)

***

[@blue/auth-client](../README.md) / AuthClient

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

> **get** **principal**(): [`Principal`](../interfaces/Principal.md) \| `null`

##### Returns

[`Principal`](../interfaces/Principal.md) \| `null`

***

### state

#### Get Signature

> **get** **state**(): [`AuthenticationState`](../interfaces/AuthenticationState.md)

##### Returns

[`AuthenticationState`](../interfaces/AuthenticationState.md)

## Methods

### authenticate()

> **authenticate**(`adapterId`, `credentials`): `Promise`\<[`AuthResult`](../interfaces/AuthResult.md)\>

Authenticates the user using the specified adapter.

#### Parameters

##### adapterId

`string`

The ID of the adapter to use.

##### credentials

`unknown`

The credentials to authenticate with.

#### Returns

`Promise`\<[`AuthResult`](../interfaces/AuthResult.md)\>

The [AuthResult](../interfaces/AuthResult.md) containing the principal and token.

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

> **refresh**(`adapterId`): `Promise`\<[`AuthResult`](../interfaces/AuthResult.md)\>

Refreshes the current token.

#### Parameters

##### adapterId

`string`

The ID of the adapter to use for refresh.

#### Returns

`Promise`\<[`AuthResult`](../interfaces/AuthResult.md)\>

The updated [AuthResult](../interfaces/AuthResult.md).

***

### validate()

> **validate**(`adapterId`): `Promise`\<[`Principal`](../interfaces/Principal.md) \| `null`\>

Validates the current token and updates the authentication state.

#### Parameters

##### adapterId

`string`

The ID of the adapter to use for validation.

#### Returns

`Promise`\<[`Principal`](../interfaces/Principal.md) \| `null`\>

The validated [Principal](../interfaces/Principal.md), or null if validation fails.
