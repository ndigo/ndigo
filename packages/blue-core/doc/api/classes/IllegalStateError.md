[**@blue/core v0.0.1**](../README.md)

***

[@blue/core](../README.md) / IllegalStateError

# Class: IllegalStateError

Represents an error indicating that an operation cannot be completed due to an invalid state or misconfiguration.

## Extends

- [`FrameworkError`](FrameworkError.md)

## Constructors

### Constructor

> **new IllegalStateError**(`message?`, `options?`): `IllegalStateError`

Creates an instance of IllegalStateError.

#### Parameters

##### message?

`string` = `'Unable to complete operation due to misconfiguration'`

The error message. Defaults to 'Unable to complete operation due to misconfiguration'.

##### options?

`ErrorOptions`

Standard `Error` options; pass `{ cause }` to preserve
  the original failure across the framework boundary
  (e.g. `Application.run()` startup failures).

#### Returns

`IllegalStateError`

#### Overrides

[`FrameworkError`](FrameworkError.md).[`constructor`](FrameworkError.md#constructor)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

The string tag for this class.

##### Returns

`string`

#### Overrides

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
