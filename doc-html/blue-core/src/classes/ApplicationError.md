[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / ApplicationError

# Class: ApplicationError

Defined in: [packages/blue-core/src/error.ts:45](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/error.ts#lines-45)

Represents a general application-level error.

## Extends

- [`Serializable`](../interfaces/Serializable.md) & `Error`

## Constructors

### Constructor

> **new ApplicationError**(`message?`): `ApplicationError`

Defined in: [packages/blue-core/src/error.ts:58](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/error.ts#lines-58)

Creates an instance of ApplicationError.
Uses `new.target.name` so subclasses inherit the correct name automatically.

#### Parameters

##### message?

`string`

The error message.

#### Returns

`ApplicationError`

#### Overrides

`AsSerializableError(Error).constructor`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-core/src/error.ts:49](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/error.ts#lines-49)

The string tag for this class.

##### Returns

`string`

## Methods

### toString()

> **toString**(): `string`

Defined in: [packages/blue-core/src/serializable.ts:27](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/serializable.ts#lines-27)

#### Returns

`string`

#### Inherited from

`AsSerializableError(Error).toString`

***

### toJSON()?

> `optional` **toJSON**(): [`JSONValue`](../type-aliases/JSONValue.md)

Defined in: [packages/blue-core/src/serializable.ts:28](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/serializable.ts#lines-28)

#### Returns

[`JSONValue`](../type-aliases/JSONValue.md)

#### Inherited from

`AsSerializableError(Error).toJSON`
