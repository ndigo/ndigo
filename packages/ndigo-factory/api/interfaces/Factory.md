[**@ndigo/factory v0.0.1**](../README.md)

***

[@ndigo/factory](../README.md) / Factory

# Interface: Factory

## Extended by

- [`HierarchicalFactory`](HierarchicalFactory.md)

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
