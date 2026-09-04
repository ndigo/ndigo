[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / StaticFileView

# Class: StaticFileView

Defined in: packages/blue-platform-node/src/static-file-view.ts:21

Serve a static file from a base directory for a matching request path.

Guards against path traversal by normalizing the resolved path and rejecting
anything that escapes the base directory.

## Constructors

### Constructor

> **new StaticFileView**(`basePath`): `StaticFileView`

Defined in: packages/blue-platform-node/src/static-file-view.ts:27

#### Parameters

##### basePath

`string`

The directory to serve files from.

#### Returns

`StaticFileView`

## Methods

### render()

> **render**(`_model`, `route`, `target`): `Promise`\<`void`\>

Defined in: packages/blue-platform-node/src/static-file-view.ts:38

Render a file to the response.

#### Parameters

##### \_model

`unknown`

Unused.

##### route

`Route`

The current route; `route.path` selects the file.

##### target

`ViewTarget`

The view target to commit output to.

#### Returns

`Promise`\<`void`\>
