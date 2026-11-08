[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [error](../README.md) / ParameterConversionError

# Class: ParameterConversionError

Thrown when a parameter converter fails at runtime.
This is a RUNTIME error (request processing time).

## Extends

- [`ParameterBindingError`](ParameterBindingError.md)

## Constructors

### Constructor

> **new ParameterConversionError**(`parameterName`, `parameterType`, `cause?`, `methodName?`, `controllerName?`): `ParameterConversionError`

#### Parameters

##### parameterName

`string`

##### parameterType

`string`

##### cause?

`Error`

##### methodName?

`string`

##### controllerName?

`string`

#### Returns

`ParameterConversionError`

#### Overrides

[`ParameterBindingError`](ParameterBindingError.md).[`constructor`](ParameterBindingError.md#constructor)

## Properties

### cause

> `readonly` **cause**: `Error` \| `null`

The conversion error that caused the failure.

#### Overrides

`ParameterBindingError.cause`

***

### controllerName

> `readonly` **controllerName**: `string` \| `null`

The controller name, when known.

#### Inherited from

[`ParameterBindingError`](ParameterBindingError.md).[`controllerName`](ParameterBindingError.md#controllername)

***

### methodName

> `readonly` **methodName**: `string` \| `null`

The handler method name, when known.

#### Inherited from

[`ParameterBindingError`](ParameterBindingError.md).[`methodName`](ParameterBindingError.md#methodname)

***

### parameterName

> `readonly` **parameterName**: `string` \| `null`

The parameter name, when known.

#### Inherited from

[`ParameterBindingError`](ParameterBindingError.md).[`parameterName`](ParameterBindingError.md#parametername)

***

### parameterType

> `readonly` **parameterType**: `string` \| `null`

The parameter type (e.g. `path:variable`).

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

#### Overrides

[`ParameterBindingError`](ParameterBindingError.md).[`[toStringTag]`](ParameterBindingError.md#tostringtag)

## Methods

### toJSON()?

> `optional` **toJSON**(): `JSONValue`

Returns a JSON-safe representation of the value.

#### Returns

`JSONValue`

#### Inherited from

[`ParameterBindingError`](ParameterBindingError.md).[`toJSON`](ParameterBindingError.md#tojson)

***

### toString()

> **toString**(): `string`

Returns a string representation of the value.

#### Returns

`string`

#### Inherited from

[`ParameterBindingError`](ParameterBindingError.md).[`toString`](ParameterBindingError.md#tostring)
