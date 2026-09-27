[**@blue/factory v0.0.1**](../README.md)

***

[@blue/factory](../README.md) / FactoryAware

# Interface: FactoryAware

Interface to be implemented by values that wish to be aware of their owning [Factory](Factory.md).

## Extends

- [`Aware`](Aware.md)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

[`Aware`](Aware.md).[`[$aware]`](Aware.md#aware)

## Methods

### setFactory()

> **setFactory**(`factory`): `void`

Setter that supplies the owning factory to the instance.

#### Parameters

##### factory

[`Factory`](Factory.md)

The factory that created this instance.

#### Returns

`void`
