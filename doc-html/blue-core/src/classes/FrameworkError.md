[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / FrameworkError

# Class: FrameworkError

Defined in: [packages/blue-core/src/error.ts:70](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/error.ts#lines-70)

Represents an error within the framework itself.

## Extends

- [`Serializable`](../interfaces/Serializable.md) & `Error`

## Extended by

- [`BindError`](BindError.md)
- [`IllegalStateError`](IllegalStateError.md)

## Constructors

### Constructor

> **new FrameworkError**(`message?`, `options?`): `FrameworkError`

Defined in: [packages/blue-core/src/error.ts:85](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/error.ts#lines-85)

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

Defined in: [packages/blue-core/src/error.ts:74](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/error.ts#lines-74)

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
