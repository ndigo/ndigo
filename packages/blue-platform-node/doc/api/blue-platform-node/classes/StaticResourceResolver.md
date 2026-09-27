[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / StaticResourceResolver

# Class: StaticResourceResolver

Resolves static files strictly inside a canonical base directory.

## Constructors

### Constructor

> **new StaticResourceResolver**(`basePath`): `StaticResourceResolver`

#### Parameters

##### basePath

`string`

The directory to serve files from. Canonicalized on
first use; must exist and be readable.

#### Returns

`StaticResourceResolver`

## Methods

### base()

> **base**(): `Promise`\<`string`\>

Canonical base directory (resolved lazily, cached).

#### Returns

`Promise`\<`string`\>

***

### resolve()

> **resolve**(`requestPath`, `options?`): `Promise`\<[`StaticResourceResult`](../interfaces/StaticResourceResult.md)\>

Resolves a request-relative path to a servable file (absolute `path`
plus MIME/validator metadata) or a classified failure. Never throws for
expected failure modes. Payload bytes are never read here — callers
open `path` (the handler streams it).

Without options this is the plain-file resolution (directories are
not-found, no variants). With options, directories resolve through
`indexNames` and may render a listing, and precompressed variants
(`<file>.br` / `<file>.gz`) are selected via `Accept-Encoding` for
compressible types.

#### Parameters

##### requestPath

`string`

The raw, undecoded path relative to the base root
  (leading `/` allowed and ignored). The serving pipeline never
  percent-decodes request paths: encoded sequences (`%2e%2e`, `%20`, …)
  are literal filename characters, so only files whose on-disk names
  literally contain them can be served — encoded traversal is inert,
  and encoded spaces/unicode filenames are not servable (TST-3).

##### options?

[`StaticResolveOptions`](../interfaces/StaticResolveOptions.md)

Optional resolution controls (D-6/D-7).

#### Returns

`Promise`\<[`StaticResourceResult`](../interfaces/StaticResourceResult.md)\>
