[**@blue/boot v0.0.1**](../README.md)

***

[@blue/boot](../README.md) / ConfigFileFormat

# Type Alias: ConfigFileFormat

> **ConfigFileFormat** = `"auto"` \| `"json"` \| `"toon"`

The config-file format to probe. `'auto'` (default) probes
`application.json` then `application.toon` per location — JSON wins on
collision; the other values restrict probing to one format. TOON files
follow spec v4.1 and decode through the optional `@toon-format/toon` peer
(see [StandardConfigFileLoader](../classes/StandardConfigFileLoader.md)).
