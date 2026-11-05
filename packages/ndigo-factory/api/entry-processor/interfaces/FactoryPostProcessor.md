[**@ndigo/factory v0.0.1**](../../README.md)

***

[@ndigo/factory](../../README.md) / [entry-processor](../README.md) / FactoryPostProcessor

# Interface: FactoryPostProcessor

Factory hook that allows for custom modification of new instances, e.g. checking for marker interfaces or wrapping them with proxies.

## Methods

### postProcessFactory()

> **postProcessFactory**(`factory`): `void`

Post-process the given factory.

#### Parameters

##### factory

[`Factory`](../../factory-contract/interfaces/Factory.md)

The factory to post-process.

#### Returns

`void`
