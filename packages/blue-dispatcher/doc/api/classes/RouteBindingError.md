[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / RouteBindingError

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
