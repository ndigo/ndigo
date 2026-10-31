[**@blue/auth-client v0.0.1**](../README.md)

***

[@blue/auth-client](../README.md) / OIDCError

# Class: OIDCError

An OIDC-specific failure. Every authorization/token failure mode throws
this so callers can distinguish provider errors from programming errors.

## Extends

- `Error`

## Constructors

### Constructor

> **new OIDCError**(`code`, `message`, `options?`): `OIDCError`

#### Parameters

##### code

[`OIDCErrorCode`](../type-aliases/OIDCErrorCode.md)

##### message

`string`

##### options?

###### cause?

`unknown`

#### Returns

`OIDCError`

#### Overrides

`Error.constructor`

## Properties

### code

> `readonly` **code**: [`OIDCErrorCode`](../type-aliases/OIDCErrorCode.md)
