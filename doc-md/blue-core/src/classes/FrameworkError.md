[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / FrameworkError

# Class: FrameworkError

Defined in: packages/blue-core/src/error.ts:69

Represents an error within the framework itself.

## Implements

Serializable

## Extends

- [`Serializable`](../interfaces/Serializable.md) & `Error`

## Extended by

- [`BindError`](BindError.md)
- [`IllegalStateError`](IllegalStateError.md)

## Constructors

### Constructor

> **new FrameworkError**(`message?`): `FrameworkError`

Defined in: packages/blue-core/src/error.ts:81

Creates an instance of FrameworkError.

#### Parameters

##### message?

`string`

The error message.

#### Returns

`FrameworkError`

#### Overrides

`AsSerializableError(Error).constructor`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-core/src/error.ts:73

The string tag for this class.

##### Returns

`string`

## Methods

### toString()

> **toString**(): `string`

Defined in: packages/blue-core/src/serializable.ts:28

#### Returns

`string`

#### Inherited from

`AsSerializableError(Error).toString`

***

### toJSON()?

> `optional` **toJSON**(): [`JSONValue`](../type-aliases/JSONValue.md)

Defined in: packages/blue-core/src/serializable.ts:29

#### Returns

[`JSONValue`](../type-aliases/JSONValue.md)

#### Inherited from

`AsSerializableError(Error).toJSON`
