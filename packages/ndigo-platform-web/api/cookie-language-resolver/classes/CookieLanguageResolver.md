[**@ndigo/platform-web v0.0.1**](../../README.md)

***

[@ndigo/platform-web](../../README.md) / [cookie-language-resolver](../README.md) / CookieLanguageResolver

# Class: CookieLanguageResolver

Resolves the active language from a persisted cookie, falling back to the
browser language and then the configured default.

The persisted user choice wins over the browser/navigator language —
the precedence rule for client-side locale resolution.

## Extends

- `AbstractLanguageResolver`

## Constructors

### Constructor

> **new CookieLanguageResolver**(`cookieName?`, `fallback?`): `CookieLanguageResolver`

Creates a cookie-backed language resolver.

#### Parameters

##### cookieName?

`string` = `'lang'`

Cookie name that stores the language.

##### fallback?

`AbstractLanguageResolver` = `...`

Resolver used when no cookie value is present
  (defaults to [NavigatorLanguageResolver](#)).

#### Returns

`CookieLanguageResolver`

#### Overrides

`AbstractLanguageResolver.constructor`

## Properties

### cookieName

> `readonly` **cookieName**: `string`

***

### defaultLanguage

> `readonly` **defaultLanguage**: `string`

Fallback language used when no route-specific language is available.

#### Inherited from

`AbstractLanguageResolver.defaultLanguage`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

## Methods

### resolveLanguage()

> **resolveLanguage**(`route`): `string`

Resolves the current language from the cookie, the fallback resolver,
or the configured default.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`string`

The resolved language tag.

#### Overrides

`AbstractLanguageResolver.resolveLanguage`
