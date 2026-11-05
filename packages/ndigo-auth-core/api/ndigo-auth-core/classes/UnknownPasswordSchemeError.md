[**@ndigo/auth-core v0.0.1**](../../README.md)

***

[@ndigo/auth-core](../../README.md) / [ndigo-auth-core](../README.md) / UnknownPasswordSchemeError

# Class: UnknownPasswordSchemeError

Error thrown when a password-hash string carries an unknown or malformed
scheme. Verification fails **loud** on unrecognized schemes (reference parity
Security 5.8+ parity): a silent `false` could hide a migration mistake
that locks users out — or, worse, a fallthrough that accepts a plaintext.

## Extends

- `Error`

## Constructors

### Constructor

> **new UnknownPasswordSchemeError**(`message`): `UnknownPasswordSchemeError`

#### Parameters

##### message

`string`

#### Returns

`UnknownPasswordSchemeError`

#### Overrides

`Error.constructor`
