[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / MissingParameterError

# Class: MissingParameterError

Defined in: packages/blue-dispatcher/src/error.ts:142

Thrown when a required parameter is missing from the request.
This is a RUNTIME error (request processing time).
Analogous to Spring's MissingServletRequestParameterException.

## Extends

- [`ParameterBindingError`](ParameterBindingError.md)

## Constructors

### Constructor

> **new MissingParameterError**(`parameterName`, `parameterType`, `methodName?`, `controllerName?`, `required?`): `MissingParameterError`

Defined in: packages/blue-dispatcher/src/error.ts:150

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

> `readonly` **parameterName**: `string` \| `null`

Defined in: packages/blue-dispatcher/src/error.ts:87

#### Inherited from

[`ParameterBindingError`](ParameterBindingError.md).[`parameterName`](ParameterBindingError.md#parametername)

***

### methodName

> `readonly` **methodName**: `string` \| `null`

Defined in: packages/blue-dispatcher/src/error.ts:88

#### Inherited from

[`ParameterBindingError`](ParameterBindingError.md).[`methodName`](ParameterBindingError.md#methodname)

***

### controllerName

> `readonly` **controllerName**: `string` \| `null`

Defined in: packages/blue-dispatcher/src/error.ts:89

#### Inherited from

[`ParameterBindingError`](ParameterBindingError.md).[`controllerName`](ParameterBindingError.md#controllername)

***

### parameterType

> `readonly` **parameterType**: `string` \| `null`

Defined in: packages/blue-dispatcher/src/error.ts:143

***

### required

> `readonly` **required**: `boolean` \| `null`

Defined in: packages/blue-dispatcher/src/error.ts:144

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/error.ts:146

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
