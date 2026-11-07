[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [data-binder](../README.md) / BindError

# Class: BindError

Represents an error that occurs during data binding operations.

## Extends

- [`FrameworkError`](../../error/classes/FrameworkError.md)

## Constructors

### Constructor

> **new BindError**(`message?`, `options?`): `BindError`

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

`BindError`

#### Inherited from

[`FrameworkError`](../../error/classes/FrameworkError.md).[`constructor`](../../error/classes/FrameworkError.md#constructor)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

The string tag for this class.

##### Returns

`string`

#### Inherited from

[`FrameworkError`](../../error/classes/FrameworkError.md).[`[toStringTag]`](../../error/classes/FrameworkError.md#tostringtag)

## Methods

### toJSON()?

> `optional` **toJSON**(): [`JSONValue`](../../serializable/type-aliases/JSONValue.md)

Returns a JSON-safe representation of the value.

#### Returns

[`JSONValue`](../../serializable/type-aliases/JSONValue.md)

#### Inherited from

[`FrameworkError`](../../error/classes/FrameworkError.md).[`toJSON`](../../error/classes/FrameworkError.md#tojson)

***

### toString()

> **toString**(): `string`

Returns a string representation of the value.

#### Returns

`string`

#### Inherited from

[`FrameworkError`](../../error/classes/FrameworkError.md).[`toString`](../../error/classes/FrameworkError.md#tostring)
