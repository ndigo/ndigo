[**@blue/auth-server v0.0.1**](../README.md)

***

[@blue/auth-server](../README.md) / InvalidCredentialsError

# Class: InvalidCredentialsError

One generic denial for every failure mode — wrong password, unknown
user, disabled account, malformed credentials — so responses never
leak which condition failed (no user enumeration via error text).

## Extends

- `Error`

## Constructors

### Constructor

> **new InvalidCredentialsError**(): `InvalidCredentialsError`

#### Returns

`InvalidCredentialsError`

#### Overrides

`Error.constructor`
