[**@ndigo/dispatcher v0.0.1**](../../../README.md)

***

[@ndigo/dispatcher](../../../README.md) / [strategies/theme-resolver-strategy](../README.md) / AsThemeResolverStrategy

# Function: AsThemeResolverStrategy()

> **AsThemeResolverStrategy**\<`T`\>(`superclass`): `Constructable`\<[`ThemeResolverStrategy`](../interfaces/ThemeResolverStrategy.md)\> & `T`

Mixin that installs the theme resolver: uses the context's `themeName` by
default and registers the resolver under its well-known name.

## Type Parameters

### T

`T` *extends* `Constructable`\<[`StrategyInitializer`](../../strategy-initializer/interfaces/StrategyInitializer.md)\>

## Parameters

### superclass

`T`

## Returns

`Constructable`\<[`ThemeResolverStrategy`](../interfaces/ThemeResolverStrategy.md)\> & `T`
