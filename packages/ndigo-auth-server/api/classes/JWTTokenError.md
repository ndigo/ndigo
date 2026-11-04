[**@ndigo/auth-server v0.0.1**](../README.md)

***

[@ndigo/auth-server](../README.md) / JWTTokenError

# Class: JWTTokenError

Error for refresh/issue/revocation failures: invalid, superseded or
revoked tokens, unknown/disabled accounts, and configuration that
cannot issue tokens. Always a `401`-class outcome at the flow level.

## Extends

- `Error`

## Constructors

### Constructor

> **new JWTTokenError**(`message`): `JWTTokenError`

#### Parameters

##### message

`string`

#### Returns

`JWTTokenError`

#### Overrides

`Error.constructor`
