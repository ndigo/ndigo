[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-domain/src](../README.md) / DomainError

# Class: DomainError

Defined in: [packages/blue-domain/src/error.ts:9](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-domain/src/error.ts#lines-9)

## Extends

- `Serializable` & `Error`

## Constructors

### Constructor

> **new DomainError**(`message?`): `DomainError`

Defined in: [packages/blue-domain/src/error.ts:24](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-domain/src/error.ts#lines-24)

Creates a domain-specific error that can be serialized safely.

#### Parameters

##### message?

`string`

Optional error message.

#### Returns

`DomainError`

#### Overrides

`AsSerializableError(Error).constructor`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-domain/src/error.ts:15](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-domain/src/error.ts#lines-15)

Returns the error tag used by object inspection.

##### Returns

`string`

The domain error tag.

## Methods

### toString()

> **toString**(): `string`

Defined in: packages/blue-core/lib/serializable.d.ts:22

#### Returns

`string`

#### Inherited from

`AsSerializableError(Error).toString`

***

### toJSON()?

> `optional` **toJSON**(): `JSONValue`

Defined in: packages/blue-core/lib/serializable.d.ts:23

#### Returns

`JSONValue`

#### Inherited from

`AsSerializableError(Error).toJSON`
