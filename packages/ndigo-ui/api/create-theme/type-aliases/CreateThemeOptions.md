[**@ndigo/ui v0.0.1**](../../README.md)

***

[@ndigo/ui](../../README.md) / [create-theme](../README.md) / CreateThemeOptions

# Type Alias: CreateThemeOptions

> **CreateThemeOptions** = `object`

Options for [createTheme](../functions/createTheme.md).

## Properties

### base?

> `optional` **base?**: [`Theme`](../../theme/interfaces/Theme.md)

Base theme whose tokens are inherited. Defaults to the Ndigo theme matching `colorScheme`.

***

### colorScheme

> **colorScheme**: [`ThemeColorScheme`](../../theme/type-aliases/ThemeColorScheme.md)

Light or dark presentation.

***

### description?

> `optional` **description?**: `string`

Optional description.

***

### name

> **name**: `string`

Theme name.

***

### tokens?

> `optional` **tokens?**: [`ThemeTokens`](../../theme/type-aliases/ThemeTokens.md)

Token overrides; merged onto the chosen base theme.
