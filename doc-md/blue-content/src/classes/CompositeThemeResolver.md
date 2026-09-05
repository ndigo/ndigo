[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-content/src](../README.md) / CompositeThemeResolver

# Class: CompositeThemeResolver

Defined in: [packages/blue-content/src/composite.ts:54](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-content/src/composite.ts#lines-54)

Chains multiple theme resolvers in priority order.

`getTheme` tries each resolver in order and returns the first successful
result. Throws when all resolvers fail to resolve the theme.

## Implements

- [`ThemeResolver`](../interfaces/ThemeResolver.md)

## Constructors

### Constructor

> **new CompositeThemeResolver**(`resolvers`): `CompositeThemeResolver`

Defined in: [packages/blue-content/src/composite.ts:62](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-content/src/composite.ts#lines-62)

Creates a composite theme resolver.

#### Parameters

##### resolvers

[`ThemeResolver`](../interfaces/ThemeResolver.md)[]

Resolvers ordered by priority, highest first.

#### Returns

`CompositeThemeResolver`

## Methods

### getTheme()

> **getTheme**(`name?`): [`Theme`](../interfaces/Theme.md)

Defined in: [packages/blue-content/src/composite.ts:76](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-content/src/composite.ts#lines-76)

Resolves the first successfully found theme across all resolvers.

#### Parameters

##### name?

`string`

Optional theme name.

#### Returns

[`Theme`](../interfaces/Theme.md)

The first resolved theme.

#### Throws

When no resolver can provide the theme.

#### Implementation of

[`ThemeResolver`](../interfaces/ThemeResolver.md).[`getTheme`](../interfaces/ThemeResolver.md#gettheme)
