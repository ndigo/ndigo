[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / HierarchicalFactory

# Interface: HierarchicalFactory

Defined in: packages/blue-factory/src/factory.ts:60

Extends [Factory](Factory.md) to provide hierarchical factory capabilities.

## Extends

- [`Factory`](Factory.md)

## Extended by

- [`ConfigurableFactory`](ConfigurableFactory.md)

## Properties

### parent

> `readonly` **parent**: [`Factory`](Factory.md) \| `null`

Defined in: packages/blue-factory/src/factory.ts:64

The parent factory in the hierarchy.

## Methods

### getInstance()

> **getInstance**\<`T`\>(`name`): `T`

Defined in: packages/blue-factory/src/factory.ts:54

Return an instance of the specified value.

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

The name of the value.

#### Returns

`T`

An instance of the value specified by the `name`.

#### Inherited from

[`Factory`](Factory.md).[`getInstance`](Factory.md#getinstance)

***

### hasOwnValue()

> **hasOwnValue**(`name`): `boolean`

Defined in: packages/blue-factory/src/factory.ts:70

Determines whether this factory contains a value with the given name.

#### Parameters

##### name

`string`

The name of the value.

#### Returns

`boolean`

`true` if this factory contains the value, `false` otherwise.
