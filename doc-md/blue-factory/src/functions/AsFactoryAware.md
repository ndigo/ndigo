[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / AsFactoryAware

# Function: AsFactoryAware()

> **AsFactoryAware**\<`T`\>(`superclass`): `Constructable`\<[`FactoryAware`](../interfaces/FactoryAware.md)\> & `T`

Defined in: packages/blue-factory/src/factory.ts:118

A mixin that adds [FactoryAware](../interfaces/FactoryAware.md) capabilities to a class.

## Type Parameters

### T

`T` *extends* `Constructable`

The type of the constructor.

## Parameters

### superclass

`T`

The superclass to extend.

## Returns

`Constructable`\<[`FactoryAware`](../interfaces/FactoryAware.md)\> & `T`

A new class that extends the superclass and implements [FactoryAware](../interfaces/FactoryAware.md).
