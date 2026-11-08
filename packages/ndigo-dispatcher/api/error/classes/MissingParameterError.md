[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [error](../README.md) / MissingParameterError

# Class: MissingParameterError

Thrown when a required parameter is missing from the request.
This is a RUNTIME error (request processing time).
Analogous to the missing-parameter binding error.

## Extends

- [`ParameterBindingError`](ParameterBindingError.md)

## Constructors

### Constructor

> **new MissingParameterError**(`parameterName`, `parameterType`, `methodName?`, `controllerName?`, `required?`): `MissingParameterError`

#### Parameters

##### parameterName

`string`

##### parameterType

`string`

##### methodName?

`string`

##### controllerName?

`string`

##### required?

`boolean` = `true`

#### Returns

`MissingParameterError`

#### Overrides

[`ParameterBindingError`](ParameterBindingError.md).[`constructor`](ParameterBindingError.md#constructor)

## Properties

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

The parameter type (e.g. `query:value`).

***

### required

> `readonly` **required**: `boolean` \| `null`

Whether the parameter was required.

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
