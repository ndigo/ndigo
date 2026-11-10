[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [helpers/app-scripts](../README.md) / captureAppOnce

# Function: captureAppOnce()

> **captureAppOnce**(`dir`, `scriptKey`, `hint`, `extraArgv?`): `Promise`\<[`CapturedRun`](../interfaces/CapturedRun.md)\>

Runs a one-shot app script with piped stdio and returns its output, for
callers that must inspect it rather than display it (MCP tools).

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

`Promise`\<[`CapturedRun`](../interfaces/CapturedRun.md)\>

The exit code plus captured stdout and stderr.
