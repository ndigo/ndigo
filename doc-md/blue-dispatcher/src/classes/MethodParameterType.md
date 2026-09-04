[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / MethodParameterType

# Class: MethodParameterType

Defined in: packages/blue-dispatcher/src/route-parameter.ts:51

Method parameter type enum

## Implements

- `Equatable`
- `Serializable`

## Constructors

### Constructor

> **new MethodParameterType**(`type`): `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:88

#### Parameters

##### type

`string`

#### Returns

`MethodParameterType`

## Properties

### COOKIE

> `static` **COOKIE**: `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:52

***

### MODEL

> `static` **MODEL**: `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:53

***

### MATRIX

> `static` **MATRIX**: `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:54

***

### PATH

> `static` **PATH**: `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:55

***

### QUERY

> `static` **QUERY**: `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:56

***

### STATE

> `static` **STATE**: `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:57

***

### SESSION

> `static` **SESSION**: `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:58

***

### BIND

> `static` **BIND**: `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:59

***

### ATTRIBUTE

> `static` **ATTRIBUTE**: `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:60

***

### HEADER

> `static` **HEADER**: `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:61

***

### BODY

> `static` **BODY**: `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:62

***

### type

> `readonly` **type**: `string`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:82

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:84

##### Returns

`string`

## Methods

### fromType()

> `static` **fromType**(`type`): `MethodParameterType` \| `null`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:64

#### Parameters

##### type

`string`

#### Returns

`MethodParameterType` \| `null`

***

### equals()

> **equals**(`value`): `boolean`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:97

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

Defined in: packages/blue-dispatcher/src/route-parameter.ts:101

#### Returns

`string`

#### Implementation of

`Serializable.toJSON`

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:105

Returns a string representation of an object.

#### Returns

`string`

#### Implementation of

`Serializable.toString`
