[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / MethodParameter

# Class: MethodParameter

Defined in: packages/blue-dispatcher/src/route-parameter.ts:125

Method parameter metadata

## Implements

- `Serializable`

## Constructors

### Constructor

> **new MethodParameter**(`type`, `name`, `required?`, `defaultValue?`, `convertType?`, `prefix?`): `MethodParameter`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:133

#### Parameters

##### type

[`MethodParameterType`](MethodParameterType.md)

##### name

`string`

##### required?

`boolean` = `false`

##### defaultValue?

`string` \| `null`

##### convertType?

###### source

`any`

###### target

`any`

##### prefix?

`string` \| `null`

#### Returns

`MethodParameter`

## Properties

### name

> `readonly` **name**: `string`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:126

***

### type

> `readonly` **type**: [`MethodParameterType`](MethodParameterType.md)

Defined in: packages/blue-dispatcher/src/route-parameter.ts:127

***

### required

> `readonly` **required**: `boolean`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:128

***

### defaultValue

> `readonly` **defaultValue**: `string` \| `null`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:129

***

### convertType

> `readonly` **convertType**: \{ `source`: `any`; `target`: `any`; \} \| `undefined`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:130

***

### prefix

> `readonly` **prefix**: `string` \| `null`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:131

## Methods

### toJSON()

> **toJSON**(): `JSONObject`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:152

#### Returns

`JSONObject`

#### Implementation of

`Serializable.toJSON`

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:163

#### Returns

`string`

#### Implementation of

`Serializable.toString`
