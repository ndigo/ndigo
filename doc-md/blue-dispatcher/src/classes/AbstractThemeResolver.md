[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractThemeResolver

# Abstract Class: AbstractThemeResolver

Defined in: packages/blue-dispatcher/src/theme-resolver.ts:21

## Extended by

- [`FixedThemeResolver`](FixedThemeResolver.md)
- [`CookieThemeResolver`](../../../blue-platform-web/src/classes/CookieThemeResolver.md)

## Implements

- [`ThemeResolver`](../interfaces/ThemeResolver.md)

## Constructors

### Constructor

> **new AbstractThemeResolver**(`defaultThemeName`): `AbstractThemeResolver`

Defined in: packages/blue-dispatcher/src/theme-resolver.ts:28

#### Parameters

##### defaultThemeName

`string`

#### Returns

`AbstractThemeResolver`

## Properties

### defaultThemeName

> `readonly` **defaultThemeName**: `string`

Defined in: packages/blue-dispatcher/src/theme-resolver.ts:22

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/theme-resolver.ts:24

##### Returns

`string`

## Methods

### resolveTheme()

> `abstract` **resolveTheme**(`route`): `string`

Defined in: packages/blue-dispatcher/src/theme-resolver.ts:37

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`string`

#### Implementation of

[`ThemeResolver`](../interfaces/ThemeResolver.md).[`resolveTheme`](../interfaces/ThemeResolver.md#resolvetheme)
