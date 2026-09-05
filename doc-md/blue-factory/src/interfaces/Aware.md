[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / Aware

# Interface: Aware

Defined in: [packages/blue-factory/src/aware.ts:23](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/aware.ts#lines-23)

An interface indicating that a value is eligible to be notified by the factory of a particular framework object through a callback-style method. The actual method signature is determined by individual subinterfaces but should typically consist of just one void-returning method that accepts a single argument, e.g. `setName( name )`.

Note that merely implementing `Aware` provides no default functionality. Rather, processing must be done explicitly, for example in an `EntryProcessor`. Refer to `ApplicationContextAwareProcessor` for an example of processing specific `*Aware` interface callbacks

## Extended by

- [`NameAware`](NameAware.md)
- [`FactoryAware`](FactoryAware.md)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: [packages/blue-factory/src/aware.ts:27](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/aware.ts#lines-27)

A symbol indicating that the value is aware.
