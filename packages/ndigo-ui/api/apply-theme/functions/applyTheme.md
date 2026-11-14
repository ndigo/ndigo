[**@ndigo/ui v0.0.1**](../../README.md)

***

[@ndigo/ui](../../README.md) / [apply-theme](../README.md) / applyTheme

# Function: applyTheme()

> **applyTheme**(`theme`, `target?`): `void`

Applies a theme to `target`, replacing any previously applied theme.

Sets the token overrides as inline custom properties, the `color-scheme`
style, and the `data-theme` / `data-color-scheme` attributes (so CSS hooks
and persistence layers can read the active theme).

## Parameters

### theme

[`Theme`](../../theme/interfaces/Theme.md)

Theme to apply.

### target?

[`ThemeTarget`](../type-aliases/ThemeTarget.md)

Element to apply to. Defaults to the document root.

## Returns

`void`
