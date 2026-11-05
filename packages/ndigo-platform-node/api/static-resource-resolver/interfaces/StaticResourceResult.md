[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [static-resource-resolver](../README.md) / StaticResourceResult

# Interface: StaticResourceResult

The result of resolving a static resource.

## Properties

### contentType?

> `readonly` `optional` **contentType?**: `string`

MIME type from the allowlist (only for `ok`).

***

### data?

> `readonly` `optional` **data?**: `Buffer`\<`ArrayBufferLike`\>

Generated payload bytes (directory listings only; `ok` file-backed
results carry `path` instead).

***

### encoding?

> `readonly` `optional` **encoding?**: [`StaticEncoding`](../type-aliases/StaticEncoding.md)

`Content-Encoding` of the served variant (D-3), when precompressed.

***

### etag?

> `readonly` `optional` **etag?**: `string`

Strong validator of the served payload (D-2): `"<hex size>-<hex mtime>"`
for originals, `"<hex size>-<hex mtime>-<encoding>"` for variants so the
two never collide under one URL. Absent for generated listings (D-7),
which are not cacheable validators.

***

### kind

> `readonly` **kind**: [`StaticResourceKind`](../type-aliases/StaticResourceKind.md)

***

### mtimeMs?

> `readonly` `optional` **mtimeMs?**: `number`

Last-modified time (ms epoch) of the served payload (only for `ok`).

***

### path?

> `readonly` `optional` **path?**: `string`

Absolute path of the payload file to open (only for `ok` file-backed
results). Callers stream from here — resolution never reads payload
bytes (SEC-8).

***

### size?

> `readonly` `optional` **size?**: `number`

Byte size of the served payload (only for `ok`; the variant's when encoded).

***

### variantAware?

> `readonly` `optional` **variantAware?**: `boolean`

True when the payload could have been served encoded (compressible MIME) — handlers add `Vary: Accept-Encoding`.
