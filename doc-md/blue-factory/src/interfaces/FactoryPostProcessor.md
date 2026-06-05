[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / FactoryPostProcessor

# Interface: FactoryPostProcessor

Defined in: packages/blue-factory/src/entry-processor.ts:98

Factory hook that allows for custom modification of new instances, e.g. checking for marker interfaces or wrapping them with proxies.

## Methods

### postProcessFactory()

> **postProcessFactory**(`factory`): `void`

Defined in: packages/blue-factory/src/entry-processor.ts:103

Post-process the given factory.

#### Parameters

##### factory

[`Factory`](Factory.md)

The factory to post-process.

#### Returns

`void`
