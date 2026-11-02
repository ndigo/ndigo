[**@blue/auth-client v0.0.1**](../README.md)

***

[@blue/auth-client](../README.md) / AuthResult

# Interface: AuthResult

The result of an authentication attempt.

## Extended by

- [`OIDCResult`](OIDCResult.md)

## Properties

### expiresAt

> **expiresAt**: `number` \| `null`

Expiration timestamp in milliseconds.

***

### principal

> **principal**: [`Principal`](Principal.md) \| `null`

The authenticated principal, or null if authentication failed.

***

### refreshToken?

> `optional` **refreshToken?**: `string` \| `null`

The provider's refresh token when the exchange or refresh returned
one (rotation-capable adapters). Callers persist it alongside `token`
and present it on the next refresh; `null`/absent means the provider
issued none for this result (so a previously captured one stays
current).

***

### token

> **token**: `string` \| `null`

The session token issued by the provider.
