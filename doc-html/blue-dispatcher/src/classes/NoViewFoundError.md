[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / NoViewFoundError

# Class: NoViewFoundError

Defined in: [packages/blue-dispatcher/src/error.ts:38](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/error.ts#lines-38)

Error thrown when a view cannot be resolved for a given view name and route.
This indicates that the specified view template or component could not be located.

## Extends

- `FrameworkError`

## Constructors

### Constructor

> **new NoViewFoundError**(`viewName`, `route`): `NoViewFoundError`

Defined in: [packages/blue-dispatcher/src/error.ts:46](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/error.ts#lines-46)

#### Parameters

##### viewName

`string`

##### route

[`Route`](#)

#### Returns

`NoViewFoundError`

#### Overrides

`FrameworkError.constructor`

## Properties

### route

> `readonly` **route**: [`Route`](#)

Defined in: [packages/blue-dispatcher/src/error.ts:39](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/error.ts#lines-39)

***

### viewName

> `readonly` **viewName**: `string`

Defined in: [packages/blue-dispatcher/src/error.ts:40](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/error.ts#lines-40)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-dispatcher/src/error.ts:42](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/error.ts#lines-42)

##### Returns

`string`

#### Overrides

`FrameworkError.[toStringTag]`

## Methods

### toString()

> **toString**(): `string`

Defined in: packages/blue-core/lib/serializable.d.ts:22

#### Returns

`string`

#### Inherited from

`FrameworkError.toString`

***

### toJSON()?

> `optional` **toJSON**(): `JSONValue`

Defined in: packages/blue-core/lib/serializable.d.ts:23

#### Returns

`JSONValue`

#### Inherited from

`FrameworkError.toJSON`
