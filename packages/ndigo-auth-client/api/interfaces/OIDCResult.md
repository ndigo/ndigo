[**@ndigo/auth-client v0.0.1**](../README.md)

***

[@ndigo/auth-client](../README.md) / OIDCResult

# Interface: OIDCResult

The result of a token-endpoint exchange: the `AuthResult` contract plus
the provider's refresh token. `refreshToken` is `null` when the provider
issued none for this result (a previously captured token then stays
current).

## Extends

- [`AuthResult`](AuthResult.md)

## Properties

### expiresAt

> **expiresAt**: `number` \| `null`

Expiration timestamp in milliseconds.

#### Inherited from

[`AuthResult`](AuthResult.md).[`expiresAt`](AuthResult.md#expiresat)

***

### principal

> **principal**: [`Principal`](Principal.md) \| `null`

The authenticated principal, or null if authentication failed.

#### Inherited from

[`AuthResult`](AuthResult.md).[`principal`](AuthResult.md#principal)

***

### refreshToken

> **refreshToken**: `string` \| `null`

The provider's refresh token (`refresh_token`), or null when none was issued.

#### Overrides

[`AuthResult`](AuthResult.md).[`refreshToken`](AuthResult.md#refreshtoken)

***

### token

> **token**: `string` \| `null`

The session token issued by the provider.

#### Inherited from

[`AuthResult`](AuthResult.md).[`token`](AuthResult.md#token)
