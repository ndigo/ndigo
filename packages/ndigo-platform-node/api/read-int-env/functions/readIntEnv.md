[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [read-int-env](../README.md) / readIntEnv

# Function: readIntEnv()

> **readIntEnv**(`env`, `name`, `options?`): `number` \| `undefined`

Reads an integer environment variable.

## Parameters

### env

`Readonly`\<`Record`\<`string`, `string` \| `undefined`\>\>

The environment record to read.

### name

`string`

The variable name (used in the error message).

### options?

[`ReadIntEnvOptions`](../interfaces/ReadIntEnvOptions.md) = `{}`

`allowZero` to accept `0` (default rejects it).

## Returns

`number` \| `undefined`

The parsed integer, or `undefined` when unset or empty.

## Throws

When the value is not an allowed integer literal.
