[**create-ndigo-app v0.0.1**](../../README.md)

***

[create-ndigo-app](../../README.md) / [templates](../README.md) / copyTemplate

# Function: copyTemplate()

> **copyTemplate**(`kind`, `targetDir`, `vars`): `void`

Recursively copies a template tree into `targetDir`, applying `{{...}}`
substitution to file contents and `__name__` substitution to file names.
Strips a trailing `.template` suffix.

## Parameters

### kind

[`AppKind`](../../types/type-aliases/AppKind.md)

### targetDir

`string`

### vars

`Record`\<`string`, `string` \| `number`\>

## Returns

`void`
