[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-domain/src](../README.md) / DomainError

# Class: DomainError

Defined in: packages/blue-domain/src/error.ts:9

## Extends

- [`Serializable`](../../../blue-core/src/interfaces/Serializable.md) & `Error`

## Constructors

### Constructor

> **new DomainError**(`message?`): `DomainError`

Defined in: packages/blue-domain/src/error.ts:14

#### Parameters

##### message?

`string`

#### Returns

`DomainError`

#### Overrides

`AsSerializableError(Error).constructor`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-domain/src/error.ts:10

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

> `optional` **toJSON**(): [`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

Defined in: packages/blue-core/src/serializable.ts:30

#### Returns

[`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

#### Inherited from

`AsSerializableError(Error).toJSON`
