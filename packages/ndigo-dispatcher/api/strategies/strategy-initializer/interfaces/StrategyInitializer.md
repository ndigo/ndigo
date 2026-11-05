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

## Methods

### addStrategy()

> **addStrategy**(`name`): `void`

#### Parameters

##### name

`string`

#### Returns

`void`

***

### getDefaultStrategy()

> **getDefaultStrategy**\<`T`\>(`context`, `key`, `strategy`): `T`

#### Type Parameters

##### T

`T`

#### Parameters

##### context

`ApplicationContext`

##### key

`string`

##### strategy

`T`

#### Returns

`T`

***

### initCollectionStrategy()

> **initCollectionStrategy**\<`T`\>(`context`, `collectionStrategyKey`, `strategyKey`, `name`, `defaultStrategy`): `void`

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### context

`ApplicationContext`

##### collectionStrategyKey

`string`

##### strategyKey

`string`

##### name

`string`

##### defaultStrategy

`T`[]

#### Returns

`void`

***

### initStrategies()

> **initStrategies**(`context`): `void`

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`

***

### initStrategy()

> **initStrategy**\<`T`\>(`context`, `strategyKey`, `name`, `defaultStrategy`): `void`

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### context

`ApplicationContext`

##### strategyKey

`string`

##### name

`string`

##### defaultStrategy

`T`

#### Returns

`void`
