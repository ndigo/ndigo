[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / Type

# Class: Type

Defined in: packages/blue-validate/src/type.ts:49



## Constructors

### Constructor

> **new Type**(`name`, `definition`): `Type`

Defined in: packages/blue-validate/src/type.ts:53

#### Parameters

##### name

`string`

##### definition

`TypeDefinition`

#### Returns

`Type`

## Properties

### name

> `readonly` **name**: `string`

Defined in: packages/blue-validate/src/type.ts:50

***

### constraints

> `readonly` **constraints**: `any`[]

Defined in: packages/blue-validate/src/type.ts:51

## Methods

### validator()

> **validator**(`value`, `params`): `boolean`

Defined in: packages/blue-validate/src/type.ts:97

#### Parameters

##### value

`any`

##### params

`any`

#### Returns

`boolean`

***

### validate()

> **validate**(`value`, `params`): `ValidationResults`

Defined in: packages/blue-validate/src/type.ts:114

#### Parameters

##### value

`any`

##### params

#### Returns

`ValidationResults`
