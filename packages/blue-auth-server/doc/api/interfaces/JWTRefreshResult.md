[**@blue/auth-server v0.0.1**](../README.md)

***

[@blue/auth-server](../README.md) / JWTRefreshResult

# Interface: JWTRefreshResult

The result of [JWTAdapter.refresh](../classes/JWTAdapter.md#refresh): the `AuthResult` contract
(`token` = the new access token) plus the rotated refresh token.

## Extends

- [`AuthResult`](#)

## Properties

### expiresAt

> **expiresAt**: `number` \| `null`

Expiration timestamp in milliseconds.

#### Inherited from

`AuthResult.expiresAt`

***

### principal

> **principal**: [`Principal`](#) \| `null`

The authenticated principal, or null if authentication failed.

#### Inherited from

`AuthResult.principal`

***

### refreshToken

> **refreshToken**: `string`

New (rotated) refresh token — the old one is dead.

***

### token

> **token**: `string`

New access token.

#### Overrides

`AuthResult.token`
