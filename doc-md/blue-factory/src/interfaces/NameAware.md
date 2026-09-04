[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / NameAware

# Interface: NameAware

Defined in: packages/blue-factory/src/aware.ts:34

Interface to be implemented by values that want to be aware of their value name in a factory.

## Extends

- [`Aware`](Aware.md)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/src/aware.ts:27

A symbol indicating that the value is aware.

#### Inherited from

[`Aware`](Aware.md).[`[$aware]`](Aware.md#aware)

***

### name

> `readonly` **name**: `string`

Defined in: packages/blue-factory/src/aware.ts:38

The name of the value in the factory.

## Methods

### setName()

> **setName**(`name`): `void`

Defined in: packages/blue-factory/src/aware.ts:43

Sets the name of the value in the factory.

#### Parameters

##### name

`string`

The name to set.

#### Returns

`void`
