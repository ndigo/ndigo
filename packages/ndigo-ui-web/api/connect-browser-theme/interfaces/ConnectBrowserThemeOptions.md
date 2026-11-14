[**@ndigo/ui-web v0.0.1**](../../README.md)

***

[@ndigo/ui-web](../../README.md) / [connect-browser-theme](../README.md) / ConnectBrowserThemeOptions

# Interface: ConnectBrowserThemeOptions

Options for [connectBrowserTheme](../functions/connectBrowserTheme.md).

## Extends

- `BrowserThemeBootstrapOptions`

## Properties

### cookieName?

> `optional` **cookieName?**: `string`

Cookie name used to store the selected theme.

#### Inherited from

`BrowserThemeBootstrapOptions.cookieName`

***

### target?

> `optional` **target?**: `ThemeTarget`

Element the theme is applied to. Defaults to the document root.

***

### themeName?

> `optional` **themeName?**: `string`

Theme name to set on the application context before resolver setup.

#### Inherited from

`BrowserThemeBootstrapOptions.themeName`

***

### themes?

> `optional` **themes?**: `Readonly`\<`Record`\<`string`, `Theme`\>\>

Application themes consulted before the built-ins.
