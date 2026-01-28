[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / ApplicationError

# Class: ApplicationError

Defined in: packages/blue-core/src/error.ts:26

## Extends

- [`Serializable`](../interfaces/Serializable.md) & `Error`

## Constructors

### Constructor

> **new ApplicationError**(`message?`): `ApplicationError`

Defined in: packages/blue-core/src/error.ts:31

#### Parameters

##### message?

`string`

#### Returns

`ApplicationError`

#### Overrides

`AsSerializableError(Error).constructor`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-core/src/error.ts:27

##### Returns

`string`

## Methods

### toString()

> **toString**(): `string`

Defined in: packages/blue-core/src/serializable.ts:29

#### Returns

`string`

#### Inherited from

`AsSerializableError(Error).toString`

***

### toJSON()?

> `optional` **toJSON**(): [`JSONValue`](../type-aliases/JSONValue.md)

Defined in: packages/blue-core/src/serializable.ts:30

#### Returns

[`JSONValue`](../type-aliases/JSONValue.md)

#### Inherited from

`AsSerializableError(Error).toJSON`
