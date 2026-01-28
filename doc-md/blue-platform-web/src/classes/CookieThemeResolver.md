[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / CookieThemeResolver

# Class: CookieThemeResolver

Defined in: packages/blue-platform-web/src/cookie-theme-resolver.ts:12

## Extends

- [`AbstractThemeResolver`](../../../blue-dispatcher/src/classes/AbstractThemeResolver.md)

## Constructors

### Constructor

> **new CookieThemeResolver**(`cookieName`, `defaultThemeName`): `CookieThemeResolver`

Defined in: packages/blue-platform-web/src/cookie-theme-resolver.ts:19

#### Parameters

##### cookieName

`string`

##### defaultThemeName

`string`

#### Returns

`CookieThemeResolver`

#### Overrides

[`AbstractThemeResolver`](../../../blue-dispatcher/src/classes/AbstractThemeResolver.md).[`constructor`](../../../blue-dispatcher/src/classes/AbstractThemeResolver.md#constructor)

## Properties

### defaultThemeName

> `readonly` **defaultThemeName**: `string`

Defined in: packages/blue-dispatcher/src/theme-resolver.ts:22

#### Inherited from

[`AbstractThemeResolver`](../../../blue-dispatcher/src/classes/AbstractThemeResolver.md).[`defaultThemeName`](../../../blue-dispatcher/src/classes/AbstractThemeResolver.md#defaultthemename)

***

### cookieName

> `readonly` **cookieName**: `string`

Defined in: packages/blue-platform-web/src/cookie-theme-resolver.ts:13

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-platform-web/src/cookie-theme-resolver.ts:15

##### Returns

`string`

#### Overrides

[`AbstractThemeResolver`](../../../blue-dispatcher/src/classes/AbstractThemeResolver.md).[`[toStringTag]`](../../../blue-dispatcher/src/classes/AbstractThemeResolver.md#tostringtag)

## Methods

### resolveTheme()

> **resolveTheme**(`route`): `string`

Defined in: packages/blue-platform-web/src/cookie-theme-resolver.ts:31

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`string`

#### Overrides

[`AbstractThemeResolver`](../../../blue-dispatcher/src/classes/AbstractThemeResolver.md).[`resolveTheme`](../../../blue-dispatcher/src/classes/AbstractThemeResolver.md#resolvetheme)
