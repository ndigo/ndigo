[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [ndigo-platform-node](../README.md) / StaticResolveOptions

# Interface: StaticResolveOptions

Options controlling resolution beyond the plain file (D-6/D-7).

## Properties

### acceptEncoding?

> `optional` **acceptEncoding?**: `string`

Client `Accept-Encoding` header — drives precompressed variant selection (D-3).

***

### indexNames?

> `optional` **indexNames?**: readonly `string`[]

Directory index files, tried in order for a directory path.

***

### listDirectories?

> `optional` **listDirectories?**: `boolean`

Generate an HTML listing for directories with no index match.

***

### maxFileSizeBytes?

> `optional` **maxFileSizeBytes?**: `number`

Reject files larger than this many bytes, checked at stat time before
anything is opened or read. `0` (default) = unlimited.

***

### serveDotfiles?

> `optional` **serveDotfiles?**: `boolean`

Whether dotfiles (any path segment beginning with `.`) may be served.
Default `false`: dotfile requests resolve `forbidden` (→ 403).
The standard `.well-known` namespace is the built-in opt-in exception —
it is served either way, so well-known URIs keep working without
exposing every hidden file (PLN-F9).
