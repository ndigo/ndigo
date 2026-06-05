[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / MissingParameterError

# Class: MissingParameterError

Defined in: packages/blue-dispatcher/src/error.ts:179

Thrown when a required parameter is missing from the request.
This is a RUNTIME error (request processing time).
Analogous to Spring's MissingServletRequestParameterException.

## Extends

- [`ParameterBindingError`](ParameterBindingError.md)

## Constructors

### Constructor

> **new MissingParameterError**(`parameterName`, `parameterType`, `methodName?`, `controllerName?`, `required?`): `MissingParameterError`

Defined in: packages/blue-dispatcher/src/error.ts:187

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

### parameterName

> `readonly` **parameterName**: `string`

Defined in: packages/blue-dispatcher/src/error.ts:122

#### Inherited from

[`ParameterBindingError`](ParameterBindingError.md).[`parameterName`](ParameterBindingError.md#parametername)

***

### methodName

> `readonly` **methodName**: `string`

Defined in: packages/blue-dispatcher/src/error.ts:123

#### Inherited from

[`ParameterBindingError`](ParameterBindingError.md).[`methodName`](ParameterBindingError.md#methodname)

***

### controllerName

> `readonly` **controllerName**: `string`

Defined in: packages/blue-dispatcher/src/error.ts:124

#### Inherited from

[`ParameterBindingError`](ParameterBindingError.md).[`controllerName`](ParameterBindingError.md#controllername)

***

### parameterType

> `readonly` **parameterType**: `string`

Defined in: packages/blue-dispatcher/src/error.ts:180

***

### required

> `readonly` **required**: `boolean`

Defined in: packages/blue-dispatcher/src/error.ts:181

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/error.ts:183

##### Returns

`string`

#### Overrides

[`ParameterBindingError`](ParameterBindingError.md).[`[toStringTag]`](ParameterBindingError.md#tostringtag)

## Methods

### toString()

> **toString**(): `string`

Defined in: packages/blue-core/lib/serializable.d.ts:22

#### Returns

`string`

#### Inherited from

[`ParameterBindingError`](ParameterBindingError.md).[`toString`](ParameterBindingError.md#tostring)

***

### toJSON()?

> `optional` **toJSON**(): `JSONValue`

Defined in: packages/blue-core/lib/serializable.d.ts:23

#### Returns

`JSONValue`

#### Inherited from

[`ParameterBindingError`](ParameterBindingError.md).[`toJSON`](ParameterBindingError.md#tojson)
