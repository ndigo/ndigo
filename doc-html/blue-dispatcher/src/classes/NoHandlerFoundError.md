[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / NoHandlerFoundError

# Class: NoHandlerFoundError

Defined in: [packages/blue-dispatcher/src/error.ts:16](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/error.ts#lines-16)

Error thrown when no suitable handler is found for a given route.
This typically indicates a misconfiguration or an unhandled route.

## Extends

- `FrameworkError`

## Constructors

### Constructor

> **new NoHandlerFoundError**(`route`): `NoHandlerFoundError`

Defined in: [packages/blue-dispatcher/src/error.ts:23](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/error.ts#lines-23)

#### Parameters

##### route

[`Route`](#)

#### Returns

`NoHandlerFoundError`

#### Overrides

`FrameworkError.constructor`

## Properties

### route

> **route**: [`Route`](#)

Defined in: [packages/blue-dispatcher/src/error.ts:17](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/error.ts#lines-17)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-dispatcher/src/error.ts:19](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/error.ts#lines-19)

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
