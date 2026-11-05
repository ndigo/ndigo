[**@ndigo/platform-web v0.0.1**](../../README.md)

***

[@ndigo/platform-web](../../README.md) / [browser-theme](../README.md) / configureBrowserTheme

# Function: configureBrowserTheme()

> **configureBrowserTheme**(`applicationContext`, `options?`): [`CookieThemeResolver`](../../cookie-theme-resolver/classes/CookieThemeResolver.md)

Configures browser theme support for an application context by wiring
cookie-backed theme resolution into the dispatcher strategy key.

## Parameters

### applicationContext

`ConfigurableApplicationContext`

The application context to configure.

### options?

[`BrowserThemeBootstrapOptions`](../type-aliases/BrowserThemeBootstrapOptions.md) = `{}`

Optional browser theme bootstrap settings.

## Returns

[`CookieThemeResolver`](../../cookie-theme-resolver/classes/CookieThemeResolver.md)

The configured cookie theme resolver.
