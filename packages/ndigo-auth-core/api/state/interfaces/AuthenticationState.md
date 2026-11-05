[**@ndigo/auth-core v0.0.1**](../../README.md)

***

[@ndigo/auth-core](../../README.md) / [state](../README.md) / AuthenticationState

# Interface: AuthenticationState

Represents the current authentication state of a user.

## Properties

### expiresAt

> **expiresAt**: `number` \| `null`

Expiration timestamp in milliseconds.

***

### isAuthenticated

> **isAuthenticated**: `boolean`

Whether the user is currently authenticated.

***

### principal

> **principal**: [`Principal`](../../principal/interfaces/Principal.md) \| `null`

The current principal, or null if unauthenticated.

***

### token

> **token**: `string` \| `null`

The active session token.
