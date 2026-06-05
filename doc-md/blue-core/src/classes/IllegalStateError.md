[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / IllegalStateError

# Class: IllegalStateError

Defined in: packages/blue-core/src/error.ts:92

Represents an error indicating that an operation cannot be completed due to an invalid state or misconfiguration.

## Extends

- [`FrameworkError`](FrameworkError.md)

## Constructors

### Constructor

> **new IllegalStateError**(`message?`): `IllegalStateError`

Defined in: packages/blue-core/src/error.ts:104

Creates an instance of IllegalStateError.

#### Parameters

##### message?

`string` = `'Unable to complete operation due to misconfiguration'`

The error message. Defaults to 'Unable to complete operation due to misconfiguration'.

#### Returns

`IllegalStateError`

#### Overrides

[`FrameworkError`](FrameworkError.md).[`constructor`](FrameworkError.md#constructor)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-core/src/error.ts:96

The string tag for this class.

##### Returns

`string`

#### Overrides

[`FrameworkError`](FrameworkError.md).[`[toStringTag]`](FrameworkError.md#tostringtag)

## Methods

### toString()

> **toString**(): `string`

Defined in: packages/blue-core/src/serializable.ts:28

#### Returns

`string`

#### Inherited from

[`FrameworkError`](FrameworkError.md).[`toString`](FrameworkError.md#tostring)

***

### toJSON()?

> `optional` **toJSON**(): [`JSONValue`](../type-aliases/JSONValue.md)

Defined in: packages/blue-core/src/serializable.ts:29

#### Returns

[`JSONValue`](../type-aliases/JSONValue.md)

#### Inherited from

[`FrameworkError`](FrameworkError.md).[`toJSON`](FrameworkError.md#tojson)
