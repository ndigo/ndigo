[**@ndigo/dispatcher v0.0.1**](../../../README.md)

***

[@ndigo/dispatcher](../../../README.md) / [strategies/strategy-initializer](../README.md) / AsStrategyInitializer

# Function: AsStrategyInitializer()

> **AsStrategyInitializer**\<`T`\>(`superclass`): `Constructable`\<[`StrategyInitializer`](../interfaces/StrategyInitializer.md)\> & `T`

Mixin that implements `StrategyInitializer`: tracks the strategy names a
composition contributes and resolves each one from the application context
once, so a subclass can mix in several strategy contracts without repeating
the wiring.

## Type Parameters

### T

`T` *extends* `Constructable`

## Parameters

### superclass

`T`

## Returns

`Constructable`\<[`StrategyInitializer`](../interfaces/StrategyInitializer.md)\> & `T`
