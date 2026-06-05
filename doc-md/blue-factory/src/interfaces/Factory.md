[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / Factory

# Interface: Factory

Defined in: packages/blue-factory/src/factory.ts:48

This interface is implemented by objects that hold a number of value definitions, each uniquely identified by a string\|string name.

The point of this approach is that the `Factory` is a central registry of application components and centralizes configuration.
`Factory` implementations should support the standard lifecycle as much as possible. The full set of initialization methods and their standard order is:
1. NameAware's `setName`
2. FactoryAware's `setFactory`
3. EnvironmentAware's `setEnvironment`
4. ApplicationEventEmitterAware's `setApplicationEventEmitter`
5. ContentSourceAware's `setContentSource`
6. ApplicationContextAware's `setApplicationContext`
7. `processBeforeInitialization`
8. `init`
9. `processAfterInitialization`

On refresh, `LifecycleProcessor#onRefresh` should start `SmartLifecycle` values in ascending phase order.

On teardown, the full lifecycle should apply:
1. `processBeforeDestruction`
2. `destroy`
3. `LifecycleProcessor#onClose` (stop `SmartLifecycle` values in descending phase order)

## See

 - [NameAware](NameAware.md)
 - [FactoryAware](FactoryAware.md)
 - EnvironmentAware
 - ApplicationEventEmitterAware
 - ContentSourceAware
 - ApplicationContextAware

## Extended by

- [`HierarchicalFactory`](HierarchicalFactory.md)

## Methods

### getInstance()

> **getInstance**\<`T`\>(`name`): `T`

Defined in: packages/blue-factory/src/factory.ts:54

Return an instance of the specified value.

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

The name of the value.

#### Returns

`T`

An instance of the value specified by the `name`.
