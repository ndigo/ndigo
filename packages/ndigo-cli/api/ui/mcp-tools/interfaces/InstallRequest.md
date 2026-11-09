[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [ui/mcp-tools](../README.md) / InstallRequest

# Interface: InstallRequest

Request for [installItems](../functions/installItems.md).

## Properties

### dir?

> `readonly` `optional` **dir?**: `string`

Application directory (defaults to the context directory).

***

### dryRun?

> `readonly` `optional` **dryRun?**: `boolean`

Plan only (default true).

***

### items

> `readonly` **items**: readonly `string`[]

Registry item names to install.

***

### overwrite?

> `readonly` `optional` **overwrite?**: `boolean`

Replace files that differ from the registry content.

***

### registry?

> `readonly` `optional` **registry?**: `string`

Registry source override.

***

### skipInstall?

> `readonly` `optional` **skipInstall?**: `boolean`

Write files without installing npm dependencies.
