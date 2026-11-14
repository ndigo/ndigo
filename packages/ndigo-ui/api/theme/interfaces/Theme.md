[**@ndigo/ui v0.0.1**](../../README.md)

***

[@ndigo/ui](../../README.md) / [theme](../README.md) / Theme

# Interface: Theme

A named theme: an identity, a color scheme, and its token overrides.

## Properties

### colorScheme

> `readonly` **colorScheme**: [`ThemeColorScheme`](../type-aliases/ThemeColorScheme.md)

Whether the theme presents as light or dark.

***

### description?

> `readonly` `optional` **description?**: `string`

Optional human-readable description.

***

### name

> `readonly` **name**: `string`

Human-readable, unique theme name (e.g. `solarized-dark`).

***

### tokens

> `readonly` **tokens**: [`ThemeTokens`](../type-aliases/ThemeTokens.md)

Token overrides applied on top of the base token set.
