[**@ndigo/content v0.0.1**](../../README.md)

***

[@ndigo/content](../../README.md) / [theme](../README.md) / StaticThemeSource

# Class: StaticThemeSource

In-memory theme source for static theme maps.

## Implements

- [`ThemeSource`](../interfaces/ThemeSource.md)

## Constructors

### Constructor

> **new StaticThemeSource**(`themes`, `defaultThemeName?`): `StaticThemeSource`

Creates a theme source backed by an in-memory theme list.

#### Parameters

##### themes

[`Theme`](../interfaces/Theme.md)[]

Available themes.

##### defaultThemeName?

`string`

Optional name of the default theme.

#### Returns

`StaticThemeSource`

#### Throws

When no valid default theme is available.

## Methods

### availableThemes()

> **availableThemes**(): `string`[]

Lists the available theme names.

#### Returns

`string`[]

The available theme names in insertion order.

***

### getTheme()

> **getTheme**(`name?`): [`Theme`](../interfaces/Theme.md)

Resolves the requested theme or falls back to the default theme.

#### Parameters

##### name?

`string`

Optional theme name.

#### Returns

[`Theme`](../interfaces/Theme.md)

The requested or default theme.

#### Throws

When the theme cannot be found.

#### Implementation of

[`ThemeSource`](../interfaces/ThemeSource.md).[`getTheme`](../interfaces/ThemeSource.md#gettheme)
