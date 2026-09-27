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

### locations?

> `optional` **locations?**: `string`[]

`./config/`, `./` by default; overridden by `BLUE_CONFIG_LOCATION`
(comma-separated directories). `optional:` prefixes are honored.

***

### reader?

> `optional` **reader?**: [`ConfigFileReader`](../type-aliases/ConfigFileReader.md) \| `null`

The file reader seam. `null` (the default) disables file loading — used
by browser environments and specs.
