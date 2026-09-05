[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractThemeResolver

# Abstract Class: AbstractThemeResolver

Defined in: [packages/blue-dispatcher/src/theme-resolver.ts:20](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/theme-resolver.ts#lines-20)

Resolves the active theme for a route.

## Extended by

- [`FixedThemeResolver`](FixedThemeResolver.md)

## Implements

- [`ThemeResolver`](../interfaces/ThemeResolver.md)

## Constructors

### Constructor

> **new AbstractThemeResolver**(`defaultThemeName`): `AbstractThemeResolver`

Defined in: [packages/blue-dispatcher/src/theme-resolver.ts:35](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/theme-resolver.ts#lines-35)

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

Defined in: [packages/blue-dispatcher/src/theme-resolver.ts:24](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/theme-resolver.ts#lines-24)

Fallback theme name used when a route-specific theme is unavailable.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-dispatcher/src/theme-resolver.ts:26](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/theme-resolver.ts#lines-26)

##### Returns

`string`

## Methods

### resolveTheme()

> `abstract` **resolveTheme**(`route`): `string`

Defined in: [packages/blue-dispatcher/src/theme-resolver.ts:45](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/theme-resolver.ts#lines-45)

Resolve the theme name for a route.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`string`

The resolved theme name.

#### Implementation of

[`ThemeResolver`](../interfaces/ThemeResolver.md).[`resolveTheme`](../interfaces/ThemeResolver.md#resolvetheme)
