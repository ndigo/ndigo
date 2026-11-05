[**@ndigo/factory v0.0.1**](../../README.md)

***

[@ndigo/factory](../../README.md) / [factory-contract](../README.md) / FactoryAware

# Interface: FactoryAware

Interface to be implemented by values that wish to be aware of their owning [Factory](Factory.md).

## Extends

- [`Aware`](../../aware/interfaces/Aware.md)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

[`Aware`](../../aware/interfaces/Aware.md).[`[$aware]`](../../aware/interfaces/Aware.md#aware)

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
