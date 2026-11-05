[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [error](../README.md) / InvalidParameterMappingError

# Class: InvalidParameterMappingError

Thrown when parameter mapping configuration is invalid.
This is a CONFIGURATION error (application startup time).

## Extends

- [`ParameterBindingError`](ParameterBindingError.md)

## Constructors

### Constructor

> **new InvalidParameterMappingError**(`message`, `parameterName?`, `methodName?`, `controllerName?`): `InvalidParameterMappingError`

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

`InvalidParameterMappingError`

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
