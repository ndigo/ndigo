[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / InvalidParameterMappingError

# Class: InvalidParameterMappingError

Defined in: packages/blue-dispatcher/src/error.ts:125

Thrown when parameter mapping configuration is invalid.
This is a CONFIGURATION error (application startup time).

## Extends

- [`ParameterBindingError`](ParameterBindingError.md)

## Constructors

### Constructor

> **new InvalidParameterMappingError**(`message`, `parameterName?`, `methodName?`, `controllerName?`): `InvalidParameterMappingError`

Defined in: packages/blue-dispatcher/src/error.ts:130

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

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/error.ts:126

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
