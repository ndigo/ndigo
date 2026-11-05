[**@ndigo/dispatcher v0.0.1**](../../../README.md)

***

[@ndigo/dispatcher](../../../README.md) / [strategies/language-resolver-strategy](../README.md) / AsLanguageResolverStrategy

# Function: AsLanguageResolverStrategy()

> **AsLanguageResolverStrategy**\<`T`\>(`superclass`): `Constructable`\<[`LanguageResolverStrategy`](../interfaces/LanguageResolverStrategy.md)\> & `T`

Mixin that plugs a `LanguageResolver` into a `StrategyInitializer`: registers
the resolver under its well-known name and resolves the context default
(English, `en-US`) when the configuration does not name one.

## Type Parameters

### T

`T` *extends* `Constructable`\<[`StrategyInitializer`](../../strategy-initializer/interfaces/StrategyInitializer.md)\>

## Parameters

### superclass

`T`

## Returns

`Constructable`\<[`LanguageResolverStrategy`](../interfaces/LanguageResolverStrategy.md)\> & `T`
