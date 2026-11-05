[**@ndigo/boot v0.0.1**](../../README.md)

***

[@ndigo/boot](../../README.md) / [config-file-loader](../README.md) / ConfigFileFormat

# Type Alias: ConfigFileFormat

> **ConfigFileFormat** = `"auto"` \| `"json"` \| `"toon"`

The config-file format to load. `'auto'` (default) probes
`application.json` then `application.toon` per location — JSON wins on
collision; the other values restrict probing to one format, and
`NDIGO_CONFIG_IMPORT` paths whose extension contradicts a restricted
`format` error out (imports inherit the rule, AD-66 D-2). TOON files
follow spec v4.1 and decode through the optional `@toon-format/toon` peer
(see [StandardConfigFileLoader](../classes/StandardConfigFileLoader.md)).
