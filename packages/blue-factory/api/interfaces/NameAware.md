[**@blue/factory v0.0.1**](../README.md)

***

[@blue/factory](../README.md) / NameAware

# Interface: NameAware

Interface to be implemented by values that want to be aware of their value name in a factory.

## Extends

- [`Aware`](Aware.md)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

[`Aware`](Aware.md).[`[$aware]`](Aware.md#aware)

***

### name

> `readonly` **name**: `string`

The name of the value in the factory.

## Methods

### setName()

> **setName**(`name`): `void`

Sets the name of the value in the factory.

#### Parameters

##### name

`string`

The name to set.

#### Returns

`void`
