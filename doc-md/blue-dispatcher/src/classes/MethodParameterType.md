[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / MethodParameterType

# Class: MethodParameterType

Defined in: packages/blue-dispatcher/src/route-parameter.ts:52

## Implements

- [`Equatable`](../../../blue-core/src/interfaces/Equatable.md)
- [`Serializable`](../../../blue-core/src/interfaces/Serializable.md)

## Constructors

### Constructor

> **new MethodParameterType**(`type`): `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:78

#### Parameters

##### type

`string`

#### Returns

`MethodParameterType`

## Properties

### COOKIE

> `static` **COOKIE**: `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:53

***

### MATRIX

> `static` **MATRIX**: `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:54

***

### QUERY

> `static` **QUERY**: `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:55

***

### type

> `readonly` **type**: `string`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:72

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:74

##### Returns

`string`

## Methods

### fromType()

> `static` **fromType**(`type`): `MethodParameterType`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:57

#### Parameters

##### type

`string`

#### Returns

`MethodParameterType`

***

### equals()

> **equals**(`value`): `boolean`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:87

#### Parameters

##### value

`any`

#### Returns

`boolean`

#### Implementation of

[`Equatable`](../../../blue-core/src/interfaces/Equatable.md).[`equals`](../../../blue-core/src/interfaces/Equatable.md#equals)

***

### toJSON()

> **toJSON**(): `string`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:91

#### Returns

`string`

#### Implementation of

[`Serializable`](../../../blue-core/src/interfaces/Serializable.md).[`toJSON`](../../../blue-core/src/interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:95

Returns a string representation of an object.

#### Returns

`string`

#### Implementation of

[`Serializable`](../../../blue-core/src/interfaces/Serializable.md).[`toString`](../../../blue-core/src/interfaces/Serializable.md#tostring)
