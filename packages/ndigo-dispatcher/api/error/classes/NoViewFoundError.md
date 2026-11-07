[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [error](../README.md) / NoViewFoundError

# Class: NoViewFoundError

Error thrown when a view cannot be resolved for a given view name and route.
This indicates that the specified view template or component could not be located.

## Extends

- [`FrameworkError`](#)

## Constructors

### Constructor

> **new NoViewFoundError**(`viewName`, `route`): `NoViewFoundError`

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

***

### viewName

> `readonly` **viewName**: `string`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

#### Overrides

`FrameworkError.[toStringTag]`

## Methods

### toJSON()?

> `optional` **toJSON**(): `JSONValue`

Returns a JSON-safe representation of the value.

#### Returns

`JSONValue`

#### Inherited from

`FrameworkError.toJSON`

***

### toString()

> **toString**(): `string`

Returns a string representation of the value.

#### Returns

`string`

#### Inherited from

`FrameworkError.toString`
