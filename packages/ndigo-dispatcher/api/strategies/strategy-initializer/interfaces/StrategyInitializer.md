[**@ndigo/dispatcher v0.0.1**](../../../README.md)

***

[@ndigo/dispatcher](../../../README.md) / [strategies/strategy-initializer](../README.md) / StrategyInitializer

# Interface: StrategyInitializer

The strategy plumbing every strategy mixin relies on: a registry of strategy
names it contributed, plus initializers that read the application context and
install the configured strategy — falling back to the mixin's default when
the context names none.

## Properties

### strategies

> **strategies**: `string`[]

Names of the strategies this composition contributes.

## Methods

### addStrategy()

> **addStrategy**(`name`): `void`

Records a strategy name to initialize later.

#### Parameters

##### name

`string`

The strategy name.

#### Returns

`void`

***

### getDefaultStrategy()

> **getDefaultStrategy**\<`T`\>(`context`, `key`, `strategy`): `T`

Installs a default strategy under a context key.

#### Type Parameters

##### T

`T`

#### Parameters

##### context

`ApplicationContext`

The application context.

##### key

`string`

The context key to register under.

##### strategy

`T`

The default strategy value.

#### Returns

`T`

The strategy now registered in the context.

***

### initCollectionStrategy()

> **initCollectionStrategy**\<`T`\>(`context`, `collectionStrategyKey`, `strategyKey`, `name`, `defaultStrategy`): `void`

Installs a collection strategy from the context or its default.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### context

`ApplicationContext`

The application context.

##### collectionStrategyKey

`string`

The context key holding the collection.

##### strategyKey

`string`

The context key holding a single strategy.

##### name

`string`

The instance property to assign.

##### defaultStrategy

`T`[]

The fallback collection.

#### Returns

`void`

***

### initStrategies()

> **initStrategies**(`context`): `void`

Runs the `init<Strategy>` initializer for every recorded strategy.

#### Parameters

##### context

`ApplicationContext`

The application context.

#### Returns

`void`

***

### initStrategy()

> **initStrategy**\<`T`\>(`context`, `strategyKey`, `name`, `defaultStrategy`): `void`

Installs a single strategy from the context or its default.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### context

`ApplicationContext`

The application context.

##### strategyKey

`string`

The context key holding the strategy.

##### name

`string`

The instance property to assign.

##### defaultStrategy

`T`

The fallback strategy.

#### Returns

`void`
