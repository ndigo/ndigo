[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [event-gateway](../README.md) / InvalidRelayError

# Class: InvalidRelayError

Error thrown when a relay is rejected and throw-on-invalid mode is enabled.

## Extends

- [`FrameworkError`](#)

## Constructors

### Constructor

> **new InvalidRelayError**(`message`): `InvalidRelayError`

Creates an invalid-relay error.

#### Parameters

##### message

`string`

The error message.

#### Returns

`InvalidRelayError`

#### Overrides

`FrameworkError.constructor`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

#### Overrides

`FrameworkError.[toStringTag]`

## Methods

### toJSON()?

> `optional` **toJSON**(): `JSONValue`

Returns a JSON-safe representation of the value.

#### Returns

`JSONValue`

#### Inherited from

`FrameworkError.toJSON`

***

### toString()

> **toString**(): `string`

Returns a string representation of the value.

#### Returns

`string`

#### Inherited from

`FrameworkError.toString`
