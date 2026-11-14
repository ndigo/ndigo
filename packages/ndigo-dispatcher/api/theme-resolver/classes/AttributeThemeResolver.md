[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [theme-resolver](../README.md) / AttributeThemeResolver

# Class: AttributeThemeResolver

Resolves the theme name stamped on the route by a platform adapter.

The attribute carries untrusted transport input (typically the `theme`
cookie), so the value is normalized before use; anything that does not
match the accepted name shape falls back to the configured default.

## Extends

- [`AbstractThemeResolver`](AbstractThemeResolver.md)

## Constructors

### Constructor

> **new AttributeThemeResolver**(`defaultThemeName`): `AttributeThemeResolver`

Store the fallback theme name.

#### Parameters

##### defaultThemeName

`string`

The theme to use by default.

#### Returns

`AttributeThemeResolver`

#### Inherited from

[`AbstractThemeResolver`](AbstractThemeResolver.md).[`constructor`](AbstractThemeResolver.md#constructor)

## Properties

### defaultThemeName

> `readonly` **defaultThemeName**: `string`

Fallback theme name used when a route-specific theme is unavailable.

#### Inherited from

[`AbstractThemeResolver`](AbstractThemeResolver.md).[`defaultThemeName`](AbstractThemeResolver.md#defaultthemename)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

#### Overrides

[`AbstractThemeResolver`](AbstractThemeResolver.md).[`[toStringTag]`](AbstractThemeResolver.md#tostringtag)

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

Use [resolveThemeName](AbstractThemeResolver.md#resolvethemename) instead.

#### Inherited from

[`AbstractThemeResolver`](AbstractThemeResolver.md).[`resolveTheme`](AbstractThemeResolver.md#resolvetheme)

***

### resolveThemeName()

> **resolveThemeName**(`route`): `string`

Resolve the requested theme from the route attribute.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`string`

The normalized requested theme or the configured default.

#### Overrides

[`AbstractThemeResolver`](AbstractThemeResolver.md).[`resolveThemeName`](AbstractThemeResolver.md#resolvethemename)
