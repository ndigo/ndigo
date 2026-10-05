[**@blue/boot v0.0.1**](../README.md)

***

[@blue/boot](../README.md) / ConfigFileLoaderOptions

# Interface: ConfigFileLoaderOptions

Options accepted by [StandardConfigFileLoader](../classes/StandardConfigFileLoader.md).

## Properties

### baseName?

> `optional` **baseName?**: `string`

The base file name (without directory or extension). Defaults to
`application`.

***

### decodeToon?

> `optional` **decodeToon?**: (`content`) => `JSONObject` \| `Promise`\<`JSONObject`\>

TOON decoder seam. Defaults to a lazy `import('@toon-format/toon')`
(the optional peer). Injectable for specs and alternative validators;
must return the plain JSON object the document decodes to. TOON strict
mode (spec §14) is the default of the reference decoder.

#### Parameters

##### content

`string`

#### Returns

`JSONObject` \| `Promise`\<`JSONObject`\>

***

### format?

> `optional` **format?**: [`ConfigFileFormat`](../type-aliases/ConfigFileFormat.md)

Which file format(s) to probe. Defaults to `'auto'` (JSON first, then
TOON). See [ConfigFileFormat](../type-aliases/ConfigFileFormat.md).

***

### locations?

> `optional` **locations?**: `string`[]

`./config/`, `./` by default; overridden by `BLUE_CONFIG_LOCATION`
(comma-separated directories). `optional:` prefixes are honored.

***

### reader?

> `optional` **reader?**: [`ConfigFileReader`](../type-aliases/ConfigFileReader.md) \| `null`

The file reader seam. `null` (the default) disables file loading — used
by browser environments and specs.
