[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / MethodParameter

# Class: MethodParameter

Defined in: packages/blue-dispatcher/src/route-parameter.ts:120

Method parameter metadata

## Implements

- `Serializable`

## Constructors

### Constructor

> **new MethodParameter**(`type`, `name`, `required?`, `defaultValue?`, `convert?`, `prefix?`): `MethodParameter`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:128

#### Parameters

##### type

[`MethodParameterType`](MethodParameterType.md)

##### name

`string`

##### required?

`boolean` = `false`

##### defaultValue?

`string` = `null`

##### convert?

[`ParameterValueConverterReference`](../type-aliases/ParameterValueConverterReference.md) = `null`

##### prefix?

`string` = `null`

#### Returns

`MethodParameter`

## Properties

### name

> `readonly` **name**: `string`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:121

***

### type

> `readonly` **type**: [`MethodParameterType`](MethodParameterType.md)

Defined in: packages/blue-dispatcher/src/route-parameter.ts:122

***

### required

> `readonly` **required**: `boolean`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:123

***

### defaultValue

> `readonly` **defaultValue**: `string`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:124

***

### convert

> `readonly` **convert**: [`ParameterValueConverterReference`](../type-aliases/ParameterValueConverterReference.md)

Defined in: packages/blue-dispatcher/src/route-parameter.ts:125

***

### prefix

> `readonly` **prefix**: `string`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:126

## Methods

### toJSON()

> **toJSON**(): `JSONObject`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:180

#### Returns

`JSONObject`

#### Implementation of

`Serializable.toJSON`

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:204

#### Returns

`string`

#### Implementation of

`Serializable.toString`
