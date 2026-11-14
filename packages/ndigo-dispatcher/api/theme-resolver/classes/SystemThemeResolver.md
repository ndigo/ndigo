[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [theme-resolver](../README.md) / SystemThemeResolver

# Class: SystemThemeResolver

Resolves the theme from the operating system's color-scheme preference.

`matchMedia` is read at call time (never cached), so an OS-level change is
honored on the next resolution. Outside a DOM runtime — or when the browser
reports no preference — the configured default applies.

## Extends

- [`AbstractThemeResolver`](AbstractThemeResolver.md)

## Constructors

### Constructor

> **new SystemThemeResolver**(`defaultThemeName`, `options?`): `SystemThemeResolver`

Creates a system-preference theme resolver.

#### Parameters

##### defaultThemeName

`string`

Theme used when no preference is available.

##### options?

[`SystemThemeResolverOptions`](../interfaces/SystemThemeResolverOptions.md) = `{}`

Optional dark/light theme name overrides.

#### Returns

`SystemThemeResolver`

#### Overrides

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

> **resolveThemeName**(`_route`): `string`

Resolve the theme matching the current system color scheme.

#### Parameters

##### \_route

[`Route`](#)

The current route.

#### Returns

`string`

The dark/light theme name or the configured default.

#### Overrides

[`AbstractThemeResolver`](AbstractThemeResolver.md).[`resolveThemeName`](AbstractThemeResolver.md#resolvethemename)
