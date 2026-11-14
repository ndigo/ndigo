[**@ndigo/ui-web v0.0.1**](../../README.md)

***

[@ndigo/ui-web](../../README.md) / [connect-browser-theme](../README.md) / connectBrowserTheme

# Function: connectBrowserTheme()

> **connectBrowserTheme**(`context`, `options?`): [`BrowserThemeConnection`](../interfaces/BrowserThemeConnection.md)

Wires cookie-backed theme resolution into the browser app and applies the
current theme.

One call replaces the client-side bootstrap: it installs
`CookieThemeResolver` (via `configureBrowserTheme`), resolves in the
documented order (cookie → system preference → context default), and
applies the result so the page matches the negotiated theme before any
interaction. For a full-stack app the server has already rendered the same
attributes; applying them again is idempotent.

## Parameters

### context

`ConfigurableApplicationContext`

The browser application context.

### options?

[`ConnectBrowserThemeOptions`](../interfaces/ConnectBrowserThemeOptions.md) = `{}`

Cookie name, seed theme, target element, and theme map.

## Returns

[`BrowserThemeConnection`](../interfaces/BrowserThemeConnection.md)

A handle exposing the applied theme and a one-call switcher.
