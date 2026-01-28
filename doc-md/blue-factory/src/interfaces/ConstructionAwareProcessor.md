[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / ConstructionAwareProcessor

# Interface: ConstructionAwareProcessor

Defined in: packages/blue-factory/src/entry-processor.ts:15

## Methods

### processAfterConstruction()

> **processAfterConstruction**\<`T`\>(`name`, `instance`): `boolean`

Defined in: packages/blue-factory/src/entry-processor.ts:16

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

##### instance

`T`

#### Returns

`boolean`

***

### processBeforeConstruction()

> **processBeforeConstruction**\<`T`\>(`name`, `constructor`, `argumentsList?`): `T`

Defined in: packages/blue-factory/src/entry-processor.ts:17

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

##### constructor

`Function`

##### argumentsList?

`any`[]

#### Returns

`T`

***

### processProperties()

> **processProperties**\<`T`\>(`properties`, `name`, `instance`): `PropertyDescriptorMap`

Defined in: packages/blue-factory/src/entry-processor.ts:18

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### properties

`PropertyDescriptorMap`

##### name

`string`

##### instance

`T`

#### Returns

`PropertyDescriptorMap`
