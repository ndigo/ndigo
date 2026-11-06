[**@ndigo/auth-server v0.0.1**](../../README.md)

***

[@ndigo/auth-server](../../README.md) / [credentials-auth-adapter](../README.md) / InvalidCredentialsError

# Class: InvalidCredentialsError

One generic denial for every failure mode — wrong password, unknown
user, disabled account, malformed credentials — so responses never
leak which condition failed (no user enumeration via error text).

## Extends

- `ApplicationError`

## Constructors

### Constructor

> **new InvalidCredentialsError**(): `InvalidCredentialsError`

#### Returns

`InvalidCredentialsError`

#### Overrides

`ApplicationError.constructor`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

The string tag for this class.

##### Returns

`string`

#### Inherited from

`ApplicationError.[toStringTag]`

## Methods

### toJSON()?

> `optional` **toJSON**(): `JSONValue`

#### Returns

`JSONValue`

#### Inherited from

`ApplicationError.toJSON`

***

### toString()

> **toString**(): `string`

#### Returns

`string`

#### Inherited from

`ApplicationError.toString`
