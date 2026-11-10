[**create-ndigo-app v0.0.1**](../../README.md)

***

[create-ndigo-app](../../README.md) / [templates](../README.md) / planTemplate

# Function: planTemplate()

> **planTemplate**(`kind`, `vars`): [`PlannedFile`](../../types/interfaces/PlannedFile.md)[]

Resolves the template tree for a kind into a file plan, applying `{{...}}`
substitution to file contents and `__name__` substitution to file names.
Strips a trailing `.template` suffix. Reads only; writes nothing.

## Parameters

### kind

[`AppKind`](../../types/type-aliases/AppKind.md)

The application kind whose template tree is planned.

### vars

`Record`\<`string`, `string` \| `number`\>

The `{{key}}` substitution map.

## Returns

[`PlannedFile`](../../types/interfaces/PlannedFile.md)[]

One entry per template file, in directory order.
