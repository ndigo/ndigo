[**@blue/platform-web v0.0.1**](../../README.md)

***

[@blue/platform-web](../../README.md) / [blue-platform-web](../README.md) / CookieThemeResolver

# Class: CookieThemeResolver

## Extends

- `AbstractThemeResolver`

## Constructors

### Constructor

> **new CookieThemeResolver**(`cookieName?`, `defaultThemeName?`): `CookieThemeResolver`

Creates a cookie-backed theme resolver.

#### Parameters

##### cookieName?

`string` = `'theme'`

Cookie name that stores the theme.

##### defaultThemeName?

`string` = `'default'`

Fallback theme when the cookie is absent.

#### Returns

`CookieThemeResolver`

#### Overrides

`AbstractThemeResolver.constructor`

## Properties

### cookieName

> `readonly` **cookieName**: `string`

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

### resolveTheme()

> **resolveTheme**(`route`): `string`

Resolves the current theme from cookies or the fallback value.

#### Parameters

##### route

[`Route`](#)

#### Returns

`string`

#### Overrides

`AbstractThemeResolver.resolveTheme`

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
