[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / FixedThemeResolver

# Class: FixedThemeResolver

Defined in: packages/blue-dispatcher/src/theme-resolver.ts:53

Resolve a fixed theme regardless of route.

## Extends

- [`AbstractThemeResolver`](AbstractThemeResolver.md)

## Constructors

### Constructor

> **new FixedThemeResolver**(`defaultThemeName`): `FixedThemeResolver`

Defined in: packages/blue-dispatcher/src/theme-resolver.ts:37

Store the fallback theme name.

#### Parameters

##### defaultThemeName

`string`

The theme to use by default.

#### Returns

`FixedThemeResolver`

#### Inherited from

[`AbstractThemeResolver`](AbstractThemeResolver.md).[`constructor`](AbstractThemeResolver.md#constructor)

## Properties

### defaultThemeName

> `readonly` **defaultThemeName**: `string`

Defined in: packages/blue-dispatcher/src/theme-resolver.ts:26

Fallback theme name used when a route-specific theme is unavailable.

#### Inherited from

[`AbstractThemeResolver`](AbstractThemeResolver.md).[`defaultThemeName`](AbstractThemeResolver.md#defaultthemename)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/theme-resolver.ts:28

##### Returns

`string`

#### Inherited from

[`AbstractThemeResolver`](AbstractThemeResolver.md).[`[toStringTag]`](AbstractThemeResolver.md#tostringtag)

## Methods

### resolveTheme()

> **resolveTheme**(`route`): `string`

Defined in: packages/blue-dispatcher/src/theme-resolver.ts:60

Return the configured fallback theme.

#### Parameters

##### route

`Route`

The current route.

#### Returns

`string`

The configured theme name.

#### Overrides

[`AbstractThemeResolver`](AbstractThemeResolver.md).[`resolveTheme`](AbstractThemeResolver.md#resolvetheme)
