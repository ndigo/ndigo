[**@blue/factory v0.0.1**](../README.md)

***

[@blue/factory](../README.md) / HierarchicalFactory

# Interface: HierarchicalFactory

Extends [Factory](Factory.md) to provide hierarchical factory capabilities.

## Extends

- [`Factory`](Factory.md)

## Extended by

- [`ConfigurableFactory`](ConfigurableFactory.md)

## Properties

### parent

> `readonly` **parent**: [`Factory`](Factory.md) \| `null`

The parent factory in the hierarchy.

## Methods

### getInstance()

> **getInstance**\<`T`\>(`name`): `T`

Return an instance of the specified value.

#### Type Parameters

##### T

`T` = `unknown`

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

Determines whether this factory contains a value with the given name.

#### Parameters

##### name

`string`

The name of the value.

#### Returns

`boolean`

`true` if this factory contains the value, `false` otherwise.
