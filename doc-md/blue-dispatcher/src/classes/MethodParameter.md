[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / MethodParameter

# Class: MethodParameter

Defined in: packages/blue-dispatcher/src/route-parameter.ts:110

## Implements

- [`Serializable`](../../../blue-core/src/interfaces/Serializable.md)

## Constructors

### Constructor

> **new MethodParameter**(`type`, `name`, `required`, `defaultValue`): `MethodParameter`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:116

#### Parameters

##### type

[`MethodParameterType`](MethodParameterType.md)

##### name

`string`

##### required

`boolean` = `false`

##### defaultValue

`string` = `null`

#### Returns

`MethodParameter`

## Properties

### name

> `readonly` **name**: `string`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:111

***

### type

> `readonly` **type**: [`MethodParameterType`](MethodParameterType.md)

Defined in: packages/blue-dispatcher/src/route-parameter.ts:112

***

### required

> `readonly` **required**: `boolean`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:113

***

### defaultValue

> `readonly` **defaultValue**: `string`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:114

## Methods

### toJSON()

> **toJSON**(): [`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)

Defined in: packages/blue-dispatcher/src/route-parameter.ts:146

#### Returns

[`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)

#### Implementation of

[`Serializable`](../../../blue-core/src/interfaces/Serializable.md).[`toJSON`](../../../blue-core/src/interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:155

#### Returns

`string`

#### Implementation of

[`Serializable`](../../../blue-core/src/interfaces/Serializable.md).[`toString`](../../../blue-core/src/interfaces/Serializable.md#tostring)
