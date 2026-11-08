[**@ndigo/auth-core v0.0.1**](../../README.md)

***

[@ndigo/auth-core](../../README.md) / [session](../README.md) / AuthSession

# Interface: AuthSession

Represents an authenticated user session.

Sessions are managed by the framework and provide access to the current
principal, authentication token, and session lifecycle methods.

## Properties

### isAuthenticated

> `readonly` **isAuthenticated**: `boolean`

Whether both a principal and token are set.

***

### principal

> `readonly` **principal**: [`Principal`](../../principal/interfaces/Principal.md) \| `null`

The authenticated principal, or `null`.

***

### token

> `readonly` **token**: `string` \| `null`

The session/access token, or `null`.

## Methods

### clear()

> **clear**(): `void`

Clears the session, resetting to an unauthenticated state.

#### Returns

`void`

***

### setPrincipal()

> **setPrincipal**(`principal`, `token`): `void`

Sets the principal and token, marking the session as authenticated.

#### Parameters

##### principal

[`Principal`](../../principal/interfaces/Principal.md)

The authenticated principal.

##### token

`string`

The session or access token.

#### Returns

`void`
