[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / IllegalStateError

# Class: IllegalStateError

Defined in: [packages/blue-core/src/error.ts:96](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/error.ts#lines-96)

Represents an error indicating that an operation cannot be completed due to an invalid state or misconfiguration.

## Extends

- [`FrameworkError`](FrameworkError.md)

## Constructors

### Constructor

> **new IllegalStateError**(`message?`, `options?`): `IllegalStateError`

Defined in: [packages/blue-core/src/error.ts:111](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/error.ts#lines-111)

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

Defined in: [packages/blue-core/src/error.ts:100](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/error.ts#lines-100)

The string tag for this class.

##### Returns

`string`

#### Overrides

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
