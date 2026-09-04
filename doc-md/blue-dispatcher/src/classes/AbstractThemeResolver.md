[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractThemeResolver

# Abstract Class: AbstractThemeResolver

Defined in: packages/blue-dispatcher/src/theme-resolver.ts:22

Resolves the active theme for a route.

## Extended by

- [`FixedThemeResolver`](FixedThemeResolver.md)

## Implements

- [`ThemeResolver`](../interfaces/ThemeResolver.md)

## Constructors

### Constructor

> **new AbstractThemeResolver**(`defaultThemeName`): `AbstractThemeResolver`

Defined in: packages/blue-dispatcher/src/theme-resolver.ts:37

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

Defined in: packages/blue-dispatcher/src/theme-resolver.ts:26

Fallback theme name used when a route-specific theme is unavailable.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/theme-resolver.ts:28

##### Returns

`string`

## Methods

### resolveTheme()

> `abstract` **resolveTheme**(`route`): `string`

Defined in: packages/blue-dispatcher/src/theme-resolver.ts:47

Resolve the theme name for a route.

#### Parameters

##### route

`Route`

The current route.

#### Returns

`string`

The resolved theme name.

#### Implementation of

[`ThemeResolver`](../interfaces/ThemeResolver.md).[`resolveTheme`](../interfaces/ThemeResolver.md#resolvetheme)
