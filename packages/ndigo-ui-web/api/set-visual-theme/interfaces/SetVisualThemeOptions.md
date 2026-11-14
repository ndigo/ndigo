[**@ndigo/ui-web v0.0.1**](../../README.md)

***

[@ndigo/ui-web](../../README.md) / [set-visual-theme](../README.md) / SetVisualThemeOptions

# Interface: SetVisualThemeOptions

Options for [setVisualTheme](../functions/setVisualTheme.md).

## Properties

### cookieName?

> `optional` **cookieName?**: `string`

Cookie used to persist the choice. Default: `theme`.

***

### persist?

> `optional` **persist?**: `boolean`

Whether to persist the choice. Default: `true`.

***

### target?

> `optional` **target?**: `ThemeTarget`

Element to apply the theme to. Defaults to the document root.

***

### themes?

> `optional` **themes?**: `Readonly`\<`Record`\<`string`, `Theme`\>\>

Application themes consulted before the built-ins.
