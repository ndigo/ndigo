[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / FactoryAware

# Interface: FactoryAware

Defined in: [packages/blue-factory/src/factory.ts:101](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/factory.ts#lines-101)

Interface to be implemented by values that wish to be aware of their owning [Factory](Factory.md).

## Extends

- [`Aware`](Aware.md)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: [packages/blue-factory/src/aware.ts:27](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/aware.ts#lines-27)

A symbol indicating that the value is aware.

#### Inherited from

[`Aware`](Aware.md).[`[$aware]`](Aware.md#aware)

## Methods

### setFactory()

> **setFactory**(`factory`): `void`

Defined in: [packages/blue-factory/src/factory.ts:106](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/factory.ts#lines-106)

Setter that supplies the owning factory to the instance.

#### Parameters

##### factory

[`Factory`](Factory.md)

The factory that created this instance.

#### Returns

`void`
