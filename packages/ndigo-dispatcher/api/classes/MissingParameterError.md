[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / MissingParameterError

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

#### Inherited from

[`ParameterBindingError`](ParameterBindingError.md).[`controllerName`](ParameterBindingError.md#controllername)

***

### methodName

> `readonly` **methodName**: `string` \| `null`

#### Inherited from

[`ParameterBindingError`](ParameterBindingError.md).[`methodName`](ParameterBindingError.md#methodname)

***

### parameterName

> `readonly` **parameterName**: `string` \| `null`

#### Inherited from

[`ParameterBindingError`](ParameterBindingError.md).[`parameterName`](ParameterBindingError.md#parametername)

***

### parameterType

> `readonly` **parameterType**: `string` \| `null`

***

### required

> `readonly` **required**: `boolean` \| `null`

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

#### Returns

`JSONValue`

#### Inherited from

[`ParameterBindingError`](ParameterBindingError.md).[`toJSON`](ParameterBindingError.md#tojson)

***

### toString()

> **toString**(): `string`

#### Returns

`string`

#### Inherited from

[`ParameterBindingError`](ParameterBindingError.md).[`toString`](ParameterBindingError.md#tostring)
