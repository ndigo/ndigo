[**@ndigo/core v0.0.1**](../README.md)

***

[@ndigo/core](../README.md) / BindError

# Class: BindError

Represents an error that occurs during data binding operations.

## Extends

- [`FrameworkError`](FrameworkError.md)

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

[`FrameworkError`](FrameworkError.md).[`constructor`](FrameworkError.md#constructor)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

The string tag for this class.

##### Returns

`string`

#### Inherited from

[`FrameworkError`](FrameworkError.md).[`[toStringTag]`](FrameworkError.md#tostringtag)

## Methods

### toJSON()?

> `optional` **toJSON**(): [`JSONValue`](../type-aliases/JSONValue.md)

#### Returns

[`JSONValue`](../type-aliases/JSONValue.md)

#### Inherited from

[`FrameworkError`](FrameworkError.md).[`toJSON`](FrameworkError.md#tojson)

***

### toString()

> **toString**(): `string`

#### Returns

`string`

#### Inherited from

[`FrameworkError`](FrameworkError.md).[`toString`](FrameworkError.md#tostring)
