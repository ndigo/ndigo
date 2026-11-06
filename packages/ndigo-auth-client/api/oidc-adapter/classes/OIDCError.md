[**@ndigo/auth-client v0.0.1**](../../README.md)

***

[@ndigo/auth-client](../../README.md) / [oidc-adapter](../README.md) / OIDCError

# Class: OIDCError

An OIDC-specific failure. Every authorization/token failure mode throws
this so callers can distinguish provider errors from programming errors.

## Extends

- [`FrameworkError`](#)

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

###### oauthError?

`string`

#### Returns

`OIDCError`

#### Overrides

`FrameworkError.constructor`

## Properties

### code

> `readonly` **code**: [`OIDCErrorCode`](../type-aliases/OIDCErrorCode.md)

***

### httpStatus

> `readonly` **httpStatus**: `number` \| `undefined`

The HTTP status behind a `network` failure, when one exists — lets
callers distinguish a provider rejection (e.g. a `400` on the refresh
grant) from a transport failure.

***

### oauthError

> `readonly` **oauthError**: `string` \| `undefined`

The OAuth `error` code from a provider error response, when present.

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
