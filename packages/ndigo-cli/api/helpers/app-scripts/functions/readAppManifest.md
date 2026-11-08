[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [helpers/app-scripts](../README.md) / readAppManifest

# Function: readAppManifest()

> **readAppManifest**(`dir`): `Record`\<`string`, `unknown`\> \| `null`

Reads a directory's `package.json`.

## Parameters

### dir

`string`

The application directory.

## Returns

`Record`\<`string`, `unknown`\> \| `null`

The parsed manifest, or `null` when missing or unreadable.
