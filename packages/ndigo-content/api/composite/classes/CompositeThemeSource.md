[**@ndigo/content v0.0.1**](../../README.md)

***

[@ndigo/content](../../README.md) / [composite](../README.md) / CompositeThemeSource

# Class: CompositeThemeSource

Chains multiple theme sources in priority order.

`getTheme` tries each source in order and returns the first successful
result. Throws when all sources fail to resolve the theme.

## Implements

- [`ThemeSource`](../../theme/interfaces/ThemeSource.md)

## Constructors

### Constructor

> **new CompositeThemeSource**(`sources`): `CompositeThemeSource`

Creates a composite theme source.

#### Parameters

##### sources

[`ThemeSource`](../../theme/interfaces/ThemeSource.md)[]

Sources ordered by priority, highest first.

#### Returns

`CompositeThemeSource`

## Methods

### getTheme()

> **getTheme**(`name?`): [`Theme`](../../theme/interfaces/Theme.md)

Resolves the first successfully found theme across all sources.

#### Parameters

##### name?

`string`

Optional theme name.

#### Returns

[`Theme`](../../theme/interfaces/Theme.md)

The first resolved theme.

#### Throws

When no source can provide the theme.

#### Implementation of

[`ThemeSource`](../../theme/interfaces/ThemeSource.md).[`getTheme`](../../theme/interfaces/ThemeSource.md#gettheme)
