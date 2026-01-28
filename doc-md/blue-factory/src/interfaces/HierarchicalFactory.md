[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / HierarchicalFactory

# Interface: HierarchicalFactory

Defined in: packages/blue-factory/src/factory.ts:36

## Extends

- [`Factory`](Factory.md)

## Extended by

- [`ConfigurableFactory`](ConfigurableFactory.md)

## Properties

### parent

> `readonly` **parent**: [`Factory`](Factory.md)

Defined in: packages/blue-factory/src/factory.ts:37

## Methods

### getInstance()

> **getInstance**\<`T`\>(`name`): `T`

Defined in: packages/blue-factory/src/factory.ts:33

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

#### Returns

`T`

#### Inherited from

[`Factory`](Factory.md).[`getInstance`](Factory.md#getinstance)

***

### hasOwnValue()

> **hasOwnValue**(`name`): `boolean`

Defined in: packages/blue-factory/src/factory.ts:38

#### Parameters

##### name

`string`

#### Returns

`boolean`
