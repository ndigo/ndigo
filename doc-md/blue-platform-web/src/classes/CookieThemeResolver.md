[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / CookieThemeResolver

# Class: CookieThemeResolver

Defined in: packages/blue-platform-web/src/cookie-theme-resolver.ts:13

## Extends

- `AbstractThemeResolver`

## Constructors

### Constructor

> **new CookieThemeResolver**(`cookieName?`, `defaultThemeName?`): `CookieThemeResolver`

Defined in: packages/blue-platform-web/src/cookie-theme-resolver.ts:27

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

### defaultThemeName

> `readonly` **defaultThemeName**: `string`

Defined in: packages/blue-dispatcher/lib/theme-resolver.d.ts:21

Fallback theme name used when a route-specific theme is unavailable.

#### Inherited from

`AbstractThemeResolver.defaultThemeName`

***

### cookieName

> `readonly` **cookieName**: `string`

Defined in: packages/blue-platform-web/src/cookie-theme-resolver.ts:15

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-platform-web/src/cookie-theme-resolver.ts:17

##### Returns

`string`

#### Overrides

`AbstractThemeResolver.[toStringTag]`

## Methods

### resolveTheme()

> **resolveTheme**(`route`): `string`

Defined in: packages/blue-platform-web/src/cookie-theme-resolver.ts:34

Resolves the current theme from cookies or the fallback value.

#### Parameters

##### route

`Route`

#### Returns

`string`

#### Overrides

`AbstractThemeResolver.resolveTheme`

***

### fromApplicationContext()

> `static` **fromApplicationContext**(`applicationContext`, `cookieName?`): `CookieThemeResolver`

Defined in: packages/blue-platform-web/src/cookie-theme-resolver.ts:52

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
