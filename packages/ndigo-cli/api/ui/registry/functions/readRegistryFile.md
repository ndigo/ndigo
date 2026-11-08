[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [ui/registry](../README.md) / readRegistryFile

# Function: readRegistryFile()

> **readRegistryFile**(`item`, `file`): `Promise`\<`string`\>

Reads one item file, preferring inlined content over the path.

## Parameters

### item

[`LocatedRegistryItem`](../../registry-types/interfaces/LocatedRegistryItem.md)

Item that declared the file.

### file

[`RegistryFile`](../../registry-types/interfaces/RegistryFile.md)

File entry to read.

## Returns

`Promise`\<`string`\>

The file body.
