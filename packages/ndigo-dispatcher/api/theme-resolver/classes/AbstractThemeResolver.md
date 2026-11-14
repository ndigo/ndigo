[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [theme-resolver](../README.md) / AbstractThemeResolver

# Abstract Class: AbstractThemeResolver

Base class for theme resolvers with a configurable fallback theme.

## Extended by

- [`FixedThemeResolver`](FixedThemeResolver.md)
- [`AttributeThemeResolver`](AttributeThemeResolver.md)
- [`SystemThemeResolver`](SystemThemeResolver.md)

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

### ~~resolveTheme()~~

> **resolveTheme**(`route`): `string`

Resolve the theme name for a route.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`string`

The resolved theme name.

#### Deprecated

Use [resolveThemeName](#resolvethemename) instead.

***

### resolveThemeName()

> `abstract` **resolveThemeName**(`route`): `string`

Resolve the theme name for a route.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`string`

The resolved theme name.

#### Implementation of

[`ThemeResolver`](../interfaces/ThemeResolver.md).[`resolveThemeName`](../interfaces/ThemeResolver.md#resolvethemename)
