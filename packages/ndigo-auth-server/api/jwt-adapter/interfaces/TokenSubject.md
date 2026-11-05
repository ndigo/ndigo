[**@ndigo/auth-server v0.0.1**](../../README.md)

***

[@ndigo/auth-server](../../README.md) / [jwt-adapter](../README.md) / TokenSubject

# Interface: TokenSubject

The identity to issue tokens for (`JWTAdapter.issueTokens`). When a
user store is wired, the store's record wins (roles + current
`tokenVersion`); the subject fields are the store-less fallback.

## Properties

### id

> **id**: `string`

Account id (the `sub` claim).

***

### name?

> `optional` **name?**: `string`

Display name (store-less mode).

***

### roles?

> `optional` **roles?**: readonly `string`[]

Roles (store-less mode).

***

### tokenVersion?

> `optional` **tokenVersion?**: `number`

Token version (store-less mode; store mode reads the live value).
