[**@ndigo/socket v0.0.1**](../../README.md)

***

[@ndigo/socket](../../README.md) / [stomp-frame](../README.md) / StompProtocolError

# Class: StompProtocolError

Raised on malformed frames (missing NUL, bad `content-length`, …).

## Extends

- [`FrameworkError`](#)

## Constructors

### Constructor

> **new StompProtocolError**(`message`): `StompProtocolError`

#### Parameters

##### message

`string`

Human-readable protocol failure detail.

#### Returns

`StompProtocolError`

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
