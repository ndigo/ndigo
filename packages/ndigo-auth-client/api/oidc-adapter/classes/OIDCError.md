[**@ndigo/auth-client v0.0.1**](../../README.md)

***

[@ndigo/auth-client](../../README.md) / [oidc-adapter](../README.md) / OIDCError

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

###### httpStatus?

`number`

#### Returns

`OIDCError`

#### Overrides

`Error.constructor`

## Properties

### code

> `readonly` **code**: [`OIDCErrorCode`](../type-aliases/OIDCErrorCode.md)

***

### httpStatus

> `readonly` **httpStatus**: `number` \| `undefined`

The HTTP status behind a `network` failure, when one exists — lets
callers distinguish a provider rejection (e.g. a `400` on the refresh
grant) from a transport failure.
