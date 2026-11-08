[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [error](../README.md) / NoHandlerFoundError

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

The route with no handler.

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
