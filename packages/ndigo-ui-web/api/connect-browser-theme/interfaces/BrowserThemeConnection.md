[**@ndigo/ui-web v0.0.1**](../../README.md)

***

[@ndigo/ui-web](../../README.md) / [connect-browser-theme](../README.md) / BrowserThemeConnection

# Interface: BrowserThemeConnection

Handle returned by [connectBrowserTheme](../functions/connectBrowserTheme.md).

## Properties

### cookieName

> `readonly` **cookieName**: `string`

Cookie the connection reads and writes.

***

### theme

> `readonly` **theme**: `Theme` \| `undefined`

The applied theme, or `undefined` before the first successful apply.

## Methods

### destroy()

> **destroy**(): `void`

Detaches the connection and clears the applied theme from the DOM.

The persisted cookie is left alone, so the user's choice survives a
teardown; later `setTheme` calls are no-ops.

#### Returns

`void`

***

### setTheme()

> **setTheme**(`name`): `Theme` \| `undefined`

Switches the theme: applies it, updates the context, and persists it.

#### Parameters

##### name

`string`

Requested theme name.

#### Returns

`Theme` \| `undefined`

The applied theme, or `undefined` for an unknown name.
