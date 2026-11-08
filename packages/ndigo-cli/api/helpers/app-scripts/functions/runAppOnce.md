[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [helpers/app-scripts](../README.md) / runAppOnce

# Function: runAppOnce()

> **runAppOnce**(`dir`, `scriptKey`, `hint`, `extraArgv?`): `Promise`\<`number`\>

Runs a one-shot app script (generators, db, inspect) with signal relay
and exit-code propagation — deliberately NOT respawned.

## Parameters

### dir

`string`

The app directory (absolute).

### scriptKey

`string`

The `scripts.<key>` to run.

### hint

`string`

The missing-script hint.

### extraArgv?

`string`[] = `[]`

Arguments appended to the resolved script.

## Returns

`Promise`\<`number`\>

The child's exit code.
