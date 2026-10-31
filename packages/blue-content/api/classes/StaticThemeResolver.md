[**@blue/content v0.0.1**](../README.md)

***

[@blue/content](../README.md) / StaticThemeResolver

# Class: StaticThemeResolver

In-memory theme resolver for static theme maps.

## Implements

- [`ThemeResolver`](../interfaces/ThemeResolver.md)

## Constructors

### Constructor

> **new StaticThemeResolver**(`themes`, `defaultThemeName?`): `StaticThemeResolver`

Creates a theme resolver backed by an in-memory theme list.

#### Parameters

##### themes

[`Theme`](../interfaces/Theme.md)[]

Available themes.

##### defaultThemeName?

`string`

Optional name of the default theme.

#### Returns

`StaticThemeResolver`

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

[`ThemeResolver`](../interfaces/ThemeResolver.md).[`getTheme`](../interfaces/ThemeResolver.md#gettheme)
