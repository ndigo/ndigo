[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [helpers/app-scripts](../README.md) / usageError

# Function: usageError()

> **usageError**(`message`): `Error` & `object`

The error whose command run terminates with exit code `2` (usage).
Rendering and exit behavior are owned by the CLI application config in
`index.ts` (formatException + determineExitCode, issue #148) — creating
this error must not touch `process.exitCode` directly.

## Parameters

### message

`string`

## Returns

`Error` & `object`
