[**@ndigo/mcp v0.0.1**](../../README.md)

***

[@ndigo/mcp](../../README.md) / [ui-resource](../README.md) / UiCspConfig

# Interface: UiCspConfig

Domains the host adds to the app's Content-Security-Policy.

## Properties

### baseUriDomains?

> `readonly` `optional` **baseUriDomains?**: readonly `string`[]

`base-uri` targets.

***

### connectDomains?

> `readonly` `optional` **connectDomains?**: readonly `string`[]

`connect-src` targets (fetch, XHR, WebSocket).

***

### frameDomains?

> `readonly` `optional` **frameDomains?**: readonly `string`[]

`frame-src` targets (nested iframes).

***

### resourceDomains?

> `readonly` `optional` **resourceDomains?**: readonly `string`[]

`script-src` / `style-src` / `img-src` / `font-src` / `media-src` targets.
