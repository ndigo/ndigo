[**@ndigo/core v0.0.1**](../README.md)

***

[@ndigo/core](../README.md) / ApplicationError

# Class: ApplicationError

Represents a general application-level error.

## Extends

- [`Serializable`](../interfaces/Serializable.md) & `Error`

## Constructors

### Constructor

> **new ApplicationError**(`message?`): `ApplicationError`

Creates an instance of ApplicationError.
Uses `new.target.name` so subclasses inherit the correct name automatically.

#### Parameters

##### message?

`string`

The error message.

#### Returns

`ApplicationError`

#### Overrides

`AsSerializableError(Error).constructor`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

The string tag for this class.

##### Returns

`string`

## Methods

### toJSON()?

> `optional` **toJSON**(): [`JSONValue`](../type-aliases/JSONValue.md)

#### Returns

[`JSONValue`](../type-aliases/JSONValue.md)

#### Inherited from

`AsSerializableError(Error).toJSON`

***

### toString()

> **toString**(): `string`

#### Returns

`string`

#### Inherited from

`AsSerializableError(Error).toString`
