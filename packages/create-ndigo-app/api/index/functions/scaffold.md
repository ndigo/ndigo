[**create-ndigo-app v0.0.1**](../../README.md)

***

[create-ndigo-app](../../README.md) / [index](../README.md) / scaffold

# Function: scaffold()

> **scaffold**(`argv`): `Promise`\<`number`\>

Scaffolds a standalone Ndigo application.

## Parameters

### argv

`string`[]

The raw CLI arguments (flags + positional name).

## Returns

`Promise`\<`number`\>

The process exit code (0 success, 1 runtime failure, 2 usage error).

## Example

```ts
const code = await scaffold(['my-app', '--kind', 'node', '--yes']);
process.exitCode = code;
```
