[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-boot/src](../README.md) / configureBrowserTheme

# Function: configureBrowserTheme()

> **configureBrowserTheme**(`applicationContext`, `options?`): `CookieThemeResolver`

Defined in: packages/blue-boot/src/browser-theme.ts:31

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

`CookieThemeResolver`

The configured cookie theme resolver.
