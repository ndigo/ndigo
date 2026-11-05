[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [static-resource-handler](../README.md) / StaticHandlerOptions

# Interface: StaticHandlerOptions

Handler options (D-6) — defaults preserve today's plain-file behavior.

## Properties

### cacheControl?

> `optional` **cacheControl?**: `string` \| `null`

`Cache-Control` value on success; `null` omits the header. Default `'public, max-age=3600'`.

***

### indexNames?

> `optional` **indexNames?**: readonly `string`[]

Directory index files, tried in order for a directory path. Default `['index.html']`.

***

### listDirectories?

> `optional` **listDirectories?**: `boolean`

Serve a generated HTML listing for directories with no index match. Default `false`.

***

### maxFileSizeBytes?

> `optional` **maxFileSizeBytes?**: `number`

Reject files larger than this many bytes, checked at stat time before the file is opened. `0` = unlimited. Default `0`.

***

### serveDotfiles?

> `optional` **serveDotfiles?**: `boolean`

Serve dotfiles (any path segment beginning with `.`). Default `false`:
dotfile requests answer 403. The standard `.well-known` namespace is
always served as the built-in opt-in exception (PLN-F9).

***

### spaFallback?

> `optional` **spaFallback?**: `boolean`

404 file miss + HTML-accepting GET/HEAD → serve the base index. Default `false`.
