[**@ndigo/content v0.0.1**](../../README.md)

***

[@ndigo/content](../../README.md) / [composite](../README.md) / CompositeThemeResolver

# Class: CompositeThemeResolver

Chains multiple theme resolvers in priority order.

`getTheme` tries each resolver in order and returns the first successful
result. Throws when all resolvers fail to resolve the theme.

## Implements

- [`ThemeResolver`](../../theme/interfaces/ThemeResolver.md)

## Constructors

### Constructor

> **new CompositeThemeResolver**(`resolvers`): `CompositeThemeResolver`

Creates a composite theme resolver.

#### Parameters

##### resolvers

[`ThemeResolver`](../../theme/interfaces/ThemeResolver.md)[]

Resolvers ordered by priority, highest first.

#### Returns

`CompositeThemeResolver`

## Methods

### getTheme()

> **getTheme**(`name?`): [`Theme`](../../theme/interfaces/Theme.md)

Resolves the first successfully found theme across all resolvers.

#### Parameters

##### name?

`string`

Optional theme name.

#### Returns

[`Theme`](../../theme/interfaces/Theme.md)

The first resolved theme.

#### Throws

When no resolver can provide the theme.

#### Implementation of

[`ThemeResolver`](../../theme/interfaces/ThemeResolver.md).[`getTheme`](../../theme/interfaces/ThemeResolver.md#gettheme)
