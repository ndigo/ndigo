[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [helpers/app-scripts](../README.md) / resolveAppDir

# Function: resolveAppDir()

> **resolveAppDir**(`dir`): `string`

The absolute form of `dir` (defaults to the working directory), failing
loud when it is not a directory with a `package.json` (the CLI's app
unit of address).

## Parameters

### dir

`string` \| `undefined`

The directory argument (may be `undefined`/`'.'`).

## Returns

`string`

The absolute directory.
