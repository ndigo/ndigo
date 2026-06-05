[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / MethodParameterType

# Class: MethodParameterType

Defined in: packages/blue-dispatcher/src/route-parameter.ts:49

Method parameter type enum

## Implements

- `Equatable`
- `Serializable`

## Constructors

### Constructor

> **new MethodParameterType**(`type`): `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:83

#### Parameters

##### type

`string`

#### Returns

`MethodParameterType`

## Properties

### COOKIE

> `static` **COOKIE**: `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:50

***

### MODEL

> `static` **MODEL**: `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:51

***

### MATRIX

> `static` **MATRIX**: `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:52

***

### PATH

> `static` **PATH**: `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:53

***

### QUERY

> `static` **QUERY**: `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:54

***

### STATE

> `static` **STATE**: `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:55

***

### SESSION

> `static` **SESSION**: `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:56

***

### BIND

> `static` **BIND**: `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:57

***

### ATTRIBUTE

> `static` **ATTRIBUTE**: `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:58

***

### HEADER

> `static` **HEADER**: `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:59

***

### BODY

> `static` **BODY**: `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:60

***

### type

> `readonly` **type**: `string`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:77

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:79

##### Returns

`string`

## Methods

### fromType()

> `static` **fromType**(`type`): `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:62

#### Parameters

##### type

`string`

#### Returns

`MethodParameterType`

***

### equals()

> **equals**(`value`): `boolean`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:92

Determines if this object is equal to the specified value.

#### Parameters

##### value

`any`

The value to compare with this object.

#### Returns

`boolean`

`true` if the objects are equal, `false` otherwise.

#### Implementation of

`Equatable.equals`

***

### toJSON()

> **toJSON**(): `string`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:96

#### Returns

`string`

#### Implementation of

`Serializable.toJSON`

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:100

Returns a string representation of an object.

#### Returns

`string`

#### Implementation of

`Serializable.toString`
