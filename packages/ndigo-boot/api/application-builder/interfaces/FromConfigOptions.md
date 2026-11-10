[**@ndigo/boot v0.0.1**](../../README.md)

***

[@ndigo/boot](../../README.md) / [application-builder](../README.md) / FromConfigOptions

# Interface: FromConfigOptions

Options for `ApplicationBuilder.fromConfig`.

## Properties

### decodeToon?

> `optional` **decodeToon?**: (`content`) => `JSONObject` \| `Promise`\<`JSONObject`\>

TOON decoder seam, mirroring `ConfigFileLoaderOptions.decodeToon`.
Defaults to the lazy optional `@toon-format/toon` peer; injectable for
specs and alternative validators.

#### Parameters

##### content

`string`

#### Returns

`JSONObject` \| `Promise`\<`JSONObject`\>

***

### format?

> `optional` **format?**: [`ConfigFileFormat`](../../config-file-loader/type-aliases/ConfigFileFormat.md)

Restricts how the fetched document is decoded. `'auto'` (default)
follows the address: a `.toon` path suffix decodes the document as
TOON, everything else as JSON — JSON stays the default (AD-66). The
explicit values override the address, with one refused contradiction:
`'toon'` always decodes as TOON, while `'json'` over a `.toon` address
errors instead of silently re-parsing the document as JSON.
