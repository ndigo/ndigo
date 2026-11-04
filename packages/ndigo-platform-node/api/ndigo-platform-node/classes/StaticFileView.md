[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [ndigo-platform-node](../README.md) / StaticFileView

# Class: StaticFileView

Serve a static file from a base directory for a matching request path.

Delegates every HTTP concern (conditional GET, Range, cache headers,
precompressed variants, directory modes) to [StaticResourceHandler](StaticResourceHandler.md)
(AD-28).

## Constructors

### Constructor

> **new StaticFileView**(`basePath`, `options?`): `StaticFileView`

#### Parameters

##### basePath

`string`

The directory to serve files from.

##### options?

[`StaticHandlerOptions`](../interfaces/StaticHandlerOptions.md) = `{}`

Static handler options (D-6).

#### Returns

`StaticFileView`

## Methods

### render()

> **render**(`_model`, `route`, `_target`): `Promise`\<`void`\>

Render a file to the response.

#### Parameters

##### \_model

`unknown`

Unused.

##### route

[`Route`](#)

The current route; `route.path` selects the file.

##### \_target

[`ViewTarget`](#)

Unused — the handler writes the response directly.

#### Returns

`Promise`\<`void`\>
