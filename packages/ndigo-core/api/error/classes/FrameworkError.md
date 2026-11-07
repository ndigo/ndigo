[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [error](../README.md) / FrameworkError

# Class: FrameworkError

Represents an error within the framework itself.

## Extends

- [`Serializable`](../../serializable/interfaces/Serializable.md) & `Error`

## Extended by

- [`BindError`](../../data-binder/classes/BindError.md)
- [`IllegalStateError`](IllegalStateError.md)

## Constructors

### Constructor

> **new FrameworkError**(`message?`, `options?`): `FrameworkError`

Creates an instance of FrameworkError.
Uses `new.target.name` so subclasses inherit the correct name automatically.

#### Parameters

##### message?

`string`

The error message.

##### options?

`ErrorOptions`

Standard `Error` options; `{ cause }` preserves the
  original failure (e.g. across `Application.run()` startup failures).

#### Returns

`FrameworkError`

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

> `optional` **toJSON**(): [`JSONValue`](../../serializable/type-aliases/JSONValue.md)

Returns a JSON-safe representation of the value.

#### Returns

[`JSONValue`](../../serializable/type-aliases/JSONValue.md)

#### Inherited from

`AsSerializableError(Error).toJSON`

***

### toString()

> **toString**(): `string`

Returns a string representation of the value.

#### Returns

`string`

#### Inherited from

`AsSerializableError(Error).toString`
