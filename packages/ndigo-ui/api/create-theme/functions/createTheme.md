[**@ndigo/ui v0.0.1**](../../README.md)

***

[@ndigo/ui](../../README.md) / [create-theme](../README.md) / createTheme

# Function: createTheme()

> **createTheme**(`options`): [`Theme`](../../theme/interfaces/Theme.md)

Creates a theme, inheriting tokens from a base theme when provided.

When no `base` is given, the Ndigo theme matching `colorScheme` is used so
that a theme can override a handful of tokens without re-declaring the rest.

## Parameters

### options

[`CreateThemeOptions`](../type-aliases/CreateThemeOptions.md)

Theme construction options.

## Returns

[`Theme`](../../theme/interfaces/Theme.md)

A new theme.
