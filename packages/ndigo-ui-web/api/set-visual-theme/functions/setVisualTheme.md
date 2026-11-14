[**@ndigo/ui-web v0.0.1**](../../README.md)

***

[@ndigo/ui-web](../../README.md) / [set-visual-theme](../README.md) / setVisualTheme

# Function: setVisualTheme()

> **setVisualTheme**(`context`, `name`, `options?`): `Theme` \| `undefined`

Resolves, applies, and persists a theme in one call.

The resolved theme is applied to the DOM (tokens, `color-scheme`,
`data-theme`, `data-color-scheme`), recorded on the context so later
content lookups and dispatches see it, and written to the theme cookie so a
reload keeps the choice. An unknown theme name changes nothing and returns
`undefined`, leaving the current theme in place.

## Parameters

### context

[`ThemeContextLike`](../interfaces/ThemeContextLike.md)

Theme state holder (an application context).

### name

`string`

Requested theme name.

### options?

[`SetVisualThemeOptions`](../interfaces/SetVisualThemeOptions.md) = `{}`

Target element, theme map, and persistence settings.

## Returns

`Theme` \| `undefined`

The applied theme, or `undefined` for an unknown name.
