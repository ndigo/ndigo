[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / DestructionAwareProcessor

# Interface: DestructionAwareProcessor

Defined in: [packages/blue-factory/src/entry-processor.ts:75](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/entry-processor.ts#lines-75)

Factory hook that allows for custom modification of new instances, e.g. checking for marker interfaces or wrapping them with proxies.

## Methods

### processBeforeDestruction()

> **processBeforeDestruction**\<`T`\>(`name`, `instance`): `void`

Defined in: [packages/blue-factory/src/entry-processor.ts:81](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/entry-processor.ts#lines-81)

Apply this EntryProcessor to the given instance before its destruction.

#### Type Parameters

##### T

`T` *extends* [`Destroyable`](Destroyable.md)

#### Parameters

##### name

`string`

The name of instance

##### instance

`T`

The instance to be destroyed.

#### Returns

`void`
