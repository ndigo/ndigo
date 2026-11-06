[**@ndigo/orm v0.0.1**](../../README.md)

***

[@ndigo/orm](../../README.md) / [db-adapter](../README.md) / runDbCommand

# Function: runDbCommand()

> **runDbCommand**(`registry`, `defaultName`, `argv`): `Promise`\<`number`\>

In-app runner used by `ndigo db *`. Resolves the adapter for the requested
(or default) database, invokes the action, and returns a process exit code.

Selection rules:
 - `--db <name>` wins.
 - Otherwise the configured default.
 - Otherwise, if exactly one adapter is registered, it is used.
 - Otherwise (multiple, no default) fail with exit code 2 listing names.

## Parameters

### registry

`Record`\<`string`, [`NdigoDatabaseAdapter`](../interfaces/NdigoDatabaseAdapter.md)\>

### defaultName

`string` \| `undefined`

### argv

`string`[]

## Returns

`Promise`\<`number`\>
