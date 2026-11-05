[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [helpers/app-scripts](../README.md) / runWorkspaceOnce

# Function: runWorkspaceOnce()

> **runWorkspaceOnce**(`extraArgv`, `cwd?`): `Promise`\<`number`\>

Runs a raw workspace command (the `pnpm exec nx` bridge) once.

## Parameters

### extraArgv

`string`[]

The argv after `pnpm` (e.g. `['exec', 'nx', 'g', '...']`).

### cwd?

`string`

Directory the command runs in (workspace resolution
  happens there; defaults to the CLI's working directory).

## Returns

`Promise`\<`number`\>

The child's exit code.
