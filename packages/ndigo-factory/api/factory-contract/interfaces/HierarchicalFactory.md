[**@ndigo/factory v0.0.1**](../../README.md)

***

[@ndigo/factory](../../README.md) / [factory-contract](../README.md) / HierarchicalFactory

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

Returns the value registered under `name`: constructor-registered
values are instantiated, while values registered as instances (or
primitives) are returned as-is, preserving identity (CF-12).

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### name

`string`

The name of the value.

#### Returns

`T`

The instance (or registered value) specified by the `name`.

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
