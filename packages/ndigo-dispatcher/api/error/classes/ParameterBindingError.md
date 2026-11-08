[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [error](../README.md) / ParameterBindingError

# Class: ParameterBindingError

Base error for method parameter binding issues.
Analogous to the request-binding error model.

## Extends

- [`FrameworkError`](#)

## Extended by

- [`InvalidParameterMappingError`](InvalidParameterMappingError.md)
- [`MissingParameterError`](MissingParameterError.md)
- [`ParameterConversionError`](ParameterConversionError.md)

## Constructors

### Constructor

> **new ParameterBindingError**(`message`, `parameterName?`, `methodName?`, `controllerName?`): `ParameterBindingError`

#### Parameters

##### message

`string`

##### parameterName?

`string`

##### methodName?

`string`

##### controllerName?

`string`

#### Returns

`ParameterBindingError`

#### Overrides

`FrameworkError.constructor`

## Properties

### controllerName

> `readonly` **controllerName**: `string` \| `null`

The controller name, when known.

***

### methodName

> `readonly` **methodName**: `string` \| `null`

The handler method name, when known.

***

### parameterName

> `readonly` **parameterName**: `string` \| `null`

The parameter name, when known.

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
