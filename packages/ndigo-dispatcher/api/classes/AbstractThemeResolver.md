[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / AbstractThemeResolver

# Abstract Class: AbstractThemeResolver

Resolves the active theme for a route.

## Extended by

- [`FixedThemeResolver`](FixedThemeResolver.md)

## Implements

- [`ThemeResolver`](../interfaces/ThemeResolver.md)

## Constructors

### Constructor

> **new AbstractThemeResolver**(`defaultThemeName`): `AbstractThemeResolver`

Store the fallback theme name.

#### Parameters

##### defaultThemeName

`string`

The theme to use by default.

#### Returns

`AbstractThemeResolver`

## Properties

### defaultThemeName

> `readonly` **defaultThemeName**: `string`

Fallback theme name used when a route-specific theme is unavailable.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

## Methods

### resolveTheme()

> `abstract` **resolveTheme**(`route`): `string`

Resolve the theme name for a route.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`string`

The resolved theme name.

#### Implementation of

[`ThemeResolver`](../interfaces/ThemeResolver.md).[`resolveTheme`](../interfaces/ThemeResolver.md#resolvetheme)
