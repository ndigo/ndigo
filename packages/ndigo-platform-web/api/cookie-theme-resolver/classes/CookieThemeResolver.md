[**@ndigo/platform-web v0.0.1**](../../README.md)

***

[@ndigo/platform-web](../../README.md) / [cookie-theme-resolver](../README.md) / CookieThemeResolver

# Class: CookieThemeResolver

Resolves the active theme from a persisted cookie, falling back to the
system color-scheme preference and then the configured default.

The persisted user choice wins over the system preference — the precedence
rule for client-side theme resolution. Cookie values are untrusted input
and are normalized before use.

## Extends

- `AbstractThemeResolver`

## Constructors

### Constructor

> **new CookieThemeResolver**(`cookieName?`, `defaultThemeName?`, `fallback?`): `CookieThemeResolver`

Creates a cookie-backed theme resolver.

#### Parameters

##### cookieName?

`string` = `'theme'`

Cookie name that stores the theme.

##### defaultThemeName?

`string` = `'ndigo-dark'`

Fallback theme when no cookie or system
  preference is available.

##### fallback?

`AbstractThemeResolver` = `...`

Resolver used when the cookie is absent or invalid
  (defaults to [SystemThemeResolver](#)).

#### Returns

`CookieThemeResolver`

#### Overrides

`AbstractThemeResolver.constructor`

## Properties

### cookieName

> `readonly` **cookieName**: `string`

The cookie name that stores the theme.

***

### defaultThemeName

> `readonly` **defaultThemeName**: `string`

Fallback theme name used when a route-specific theme is unavailable.

#### Inherited from

`AbstractThemeResolver.defaultThemeName`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

#### Overrides

`AbstractThemeResolver.[toStringTag]`

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

#### Inherited from

`AbstractThemeResolver.resolveTheme`

***

### resolveThemeName()

> **resolveThemeName**(`route`): `string`

Resolves the current theme from the cookie, the fallback resolver, or
the configured default.

Only well-formed names are honored — a tampered cookie (quotes,
whitespace, script characters, uppercase) falls through to the fallback
resolver instead of reaching markup or CSS.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`string`

The resolved theme name.

#### Overrides

`AbstractThemeResolver.resolveThemeName`

***

### fromApplicationContext()

> `static` **fromApplicationContext**(`applicationContext`, `cookieName?`): `CookieThemeResolver`

Creates a resolver from application-context defaults.

#### Parameters

##### applicationContext

`ApplicationContext`

Context supplying the fallback theme.

##### cookieName?

`string` = `'theme'`

Cookie name that stores the theme.

#### Returns

`CookieThemeResolver`

A cookie-backed theme resolver.
