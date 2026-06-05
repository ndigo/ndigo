[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-content/src](../README.md) / StaticThemeResolver

# Class: StaticThemeResolver

Defined in: packages/blue-content/src/theme.ts:49

In-memory theme resolver for static theme maps.

## Implements

- [`ThemeResolver`](../interfaces/ThemeResolver.md)

## Constructors

### Constructor

> **new StaticThemeResolver**(`themes`, `defaultThemeName?`): `StaticThemeResolver`

Defined in: packages/blue-content/src/theme.ts:60

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

### getTheme()

> **getTheme**(`name?`): [`Theme`](../interfaces/Theme.md)

Defined in: packages/blue-content/src/theme.ts:76

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

***

### availableThemes()

> **availableThemes**(): `string`[]

Defined in: packages/blue-content/src/theme.ts:90

Lists the available theme names.

#### Returns

`string`[]

The available theme names in insertion order.
