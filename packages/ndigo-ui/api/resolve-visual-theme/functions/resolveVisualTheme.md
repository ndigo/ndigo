[**@ndigo/ui v0.0.1**](../../README.md)

***

[@ndigo/ui](../../README.md) / [resolve-visual-theme](../README.md) / resolveVisualTheme

# Function: resolveVisualTheme()

> **resolveVisualTheme**(`name`, `themes?`): [`Theme`](../../theme/interfaces/Theme.md) \| `undefined`

Resolves a negotiated theme name to a visual theme.

Lookup order is the application map first, then the built-in
`COMMON_THEMES`. An unknown name resolves to `undefined` rather than
throwing: the request keeps rendering with the base tokens, so a missing
visual theme never fails a page.

## Parameters

### name

`string`

Theme name, normally the negotiated route theme.

### themes?

`Readonly`\<`Record`\<`string`, [`Theme`](../../theme/interfaces/Theme.md)\>\>

Optional application theme map.

## Returns

[`Theme`](../../theme/interfaces/Theme.md) \| `undefined`

The matching theme, or `undefined` when the name is unknown.
