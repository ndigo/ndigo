[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / BindError

# Class: BindError

Defined in: [packages/blue-core/src/data-binder.ts:16](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/data-binder.ts#lines-16)

Represents an error that occurs during data binding operations.

## Extends

- [`FrameworkError`](FrameworkError.md)

## Constructors

### Constructor

> **new BindError**(`message?`, `options?`): `BindError`

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

`BindError`

#### Inherited from

[`FrameworkError`](FrameworkError.md).[`constructor`](FrameworkError.md#constructor)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-core/src/error.ts:74](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/error.ts#lines-74)

The string tag for this class.

##### Returns

`string`

#### Inherited from

[`FrameworkError`](FrameworkError.md).[`[toStringTag]`](FrameworkError.md#tostringtag)

## Methods

### toString()

> **toString**(): `string`

Defined in: [packages/blue-core/src/serializable.ts:27](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/serializable.ts#lines-27)

#### Returns

`string`

#### Inherited from

[`FrameworkError`](FrameworkError.md).[`toString`](FrameworkError.md#tostring)

***

### toJSON()?

> `optional` **toJSON**(): [`JSONValue`](../type-aliases/JSONValue.md)

Defined in: [packages/blue-core/src/serializable.ts:28](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/serializable.ts#lines-28)

#### Returns

[`JSONValue`](../type-aliases/JSONValue.md)

#### Inherited from

[`FrameworkError`](FrameworkError.md).[`toJSON`](FrameworkError.md#tojson)
