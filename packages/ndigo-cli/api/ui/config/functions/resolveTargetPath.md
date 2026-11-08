[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [ui/config](../README.md) / resolveTargetPath

# Function: resolveTargetPath()

> **resolveTargetPath**(`target`, `aliases`): `string`

Maps a registry target placeholder to an application-relative path.

## Parameters

### target

`string`

Target from the registry item, e.g. `@ui/nd-dialog/nd-dialog.ts`.

### aliases

[`UiAliases`](../interfaces/UiAliases.md)

Alias table.

## Returns

`string`

The application-relative path.
