[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / NoHandlerFoundError

# Class: NoHandlerFoundError

Error thrown when no suitable handler is found for a given route.
This typically indicates a misconfiguration or an unhandled route.

## Extends

- [`FrameworkError`](#)

## Constructors

### Constructor

> **new NoHandlerFoundError**(`route`): `NoHandlerFoundError`

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

#### Returns

`JSONValue`

#### Inherited from

`FrameworkError.toJSON`

***

### toString()

> **toString**(): `string`

#### Returns

`string`

#### Inherited from

`FrameworkError.toString`
