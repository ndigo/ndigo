[**@blue/auth-client v0.0.1**](../README.md)

***

[@blue/auth-client](../README.md) / AuthResult

# Interface: AuthResult

The result of an authentication attempt.

## Properties

### expiresAt

> **expiresAt**: `number` \| `null`

Expiration timestamp in milliseconds.

***

### principal

> **principal**: [`Principal`](Principal.md) \| `null`

The authenticated principal, or null if authentication failed.

***

### token

> **token**: `string` \| `null`

The session token issued by the provider.
