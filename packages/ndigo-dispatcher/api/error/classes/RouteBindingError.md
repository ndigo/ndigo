[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [error](../README.md) / RouteBindingError

# Class: RouteBindingError

An error that represents a failure to retrieve a required [Route](#) property.

## Extends

- [`FrameworkError`](#)

## Constructors

### Constructor

> **new RouteBindingError**(`message`): `RouteBindingError`

#### Parameters

##### message

`string`

#### Returns

`RouteBindingError`

#### Overrides

`FrameworkError.constructor`

### Constructor

> **new RouteBindingError**(`route`, `name`): `RouteBindingError`

#### Parameters

##### route

[`Route`](#)

##### name

`string`

#### Returns

`RouteBindingError`

#### Overrides

`FrameworkError.constructor`

## Properties

### name

> **name**: `string`

#### Overrides

`FrameworkError.name`

***

### route

> **route**: [`Route`](#)\<`Record`\<`string`, `string`\>\> \| `null`

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
