[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / ParameterConversionError

# Class: ParameterConversionError

Defined in: packages/blue-dispatcher/src/error.ts:223

Thrown when a parameter converter fails at runtime.
This is a RUNTIME error (request processing time).

## Extends

- [`ParameterBindingError`](ParameterBindingError.md)

## Constructors

### Constructor

> **new ParameterConversionError**(`parameterName`, `parameterType`, `cause?`, `methodName?`, `controllerName?`): `ParameterConversionError`

Defined in: packages/blue-dispatcher/src/error.ts:231

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

Defined in: packages/blue-dispatcher/src/error.ts:224

***

### cause

> `readonly` **cause**: `Error`

Defined in: packages/blue-dispatcher/src/error.ts:225

#### Overrides

`ParameterBindingError.cause`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/error.ts:227

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
