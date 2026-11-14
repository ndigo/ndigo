[**@ndigo/ui v0.0.1**](../../README.md)

***

[@ndigo/ui](../../README.md) / [theme-attributes](../README.md) / ThemeAttributes

# Interface: ThemeAttributes

Attributes that select a theme in server-rendered markup.

Spread onto the root element (`<html {...themeAttributes(theme)}>`) so the
same attributes that `applyTheme` sets at runtime are present in the SSR
document, letting hydration skip re-resolving the theme.

## Properties

### data-color-scheme

> `readonly` **data-color-scheme**: [`ThemeColorScheme`](../../theme/type-aliases/ThemeColorScheme.md)

Lets the browser color native widgets to match the theme.

***

### data-theme

> `readonly` **data-theme**: `string`

Selects the theme's CSS rules and exposes the active theme to scripts.
