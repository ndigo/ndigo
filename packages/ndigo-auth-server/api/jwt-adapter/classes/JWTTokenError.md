[**@ndigo/auth-server v0.0.1**](../../README.md)

***

[@ndigo/auth-server](../../README.md) / [jwt-adapter](../README.md) / JWTTokenError

# Class: JWTTokenError

Error for refresh/issue/revocation failures: invalid, superseded or
revoked tokens, unknown/disabled accounts, and configuration that
cannot issue tokens. Always a `401`-class outcome at the flow level.

## Extends

- [`FrameworkError`](#)

## Constructors

### Constructor

> **new JWTTokenError**(`message`): `JWTTokenError`

#### Parameters

##### message

`string`

#### Returns

`JWTTokenError`

#### Overrides

`FrameworkError.constructor`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

The string tag for this class.

##### Returns

`string`

#### Inherited from

`FrameworkError.[toStringTag]`

## Methods

### toJSON()?

> `optional` **toJSON**(): `JSONValue`

#### Returns

`JSONValue`

#### Inherited from

`FrameworkError.toJSON`

***

### toString()

> **toString**(): `string`

#### Returns

`string`

#### Inherited from

`FrameworkError.toString`
