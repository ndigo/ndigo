[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [helpers/app-scripts](../README.md) / appScriptCommand

# Function: appScriptCommand()

> **appScriptCommand**(`dir`, `scriptKey`, `hint`): `object`

Resolves one of the app's declared scripts, failing loud with a hint
when absent.

## Parameters

### dir

`string`

The app directory (absolute).

### scriptKey

`string`

The `scripts.<key>` to run (`start`, `dev`, `inspect`, ...).

### hint

`string`

How to add the script (shown in the error).

## Returns

`object`

The resolved script and its execution environment.

### argv

> **argv**: `string`[]

### cwd

> **cwd**: `string`

### env

> **env**: `Record`\<`string`, `string`\>
