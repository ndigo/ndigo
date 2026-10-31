[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / environment

# Function: environment()

> **environment**(`schema`): \<`T`\>(`target`, `context`) => `T`

Marks a configuration class with the zod schema of its resolved
environment — the schema IS the contract (AD-17).

The schema validates the environment's resolved values (via
`validateEnvironment`); boot fails loudly with the aggregate report when
invalid. No coercion: validation only reports.

## Parameters

### schema

`ZodType`

The zod schema of the environment's shape.

## Returns

A class decorator.

\<`T`\>(`target`, `context`) => `T`

## Example

```ts
import { z } from 'zod';
import { environment } from '@blue/context';

@environment(z.object({ server: z.object({ port: z.coerce.number().min(1) }) }))
class AppConfig {}
```
