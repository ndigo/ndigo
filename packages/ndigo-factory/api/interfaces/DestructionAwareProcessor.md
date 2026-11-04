[**@ndigo/factory v0.0.1**](../README.md)

***

[@ndigo/factory](../README.md) / DestructionAwareProcessor

# Interface: DestructionAwareProcessor

Factory hook that allows for custom modification of new instances, e.g. checking for marker interfaces or wrapping them with proxies.

## Methods

### processBeforeDestruction()

> **processBeforeDestruction**\<`T`\>(`name`, `instance`): `void`

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
