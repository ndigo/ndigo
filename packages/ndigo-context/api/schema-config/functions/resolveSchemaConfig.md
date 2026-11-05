[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [schema-config](../README.md) / resolveSchemaConfig

# Function: resolveSchemaConfig()

> **resolveSchemaConfig**\<`S`\>(`schema`, `prefix`, `resolver`): `output`\<`S`\> \| `undefined`

Resolves raw values for an object-shaped schema from a property resolver.

Object shapes map each schema key to `${prefix}.${key}` (`prefix`
optional). Absent keys are omitted so the schema's `z.default()` and
required checks decide the outcome — a missing required key surfaces as a
zod error, not a silent `undefined`.

## Type Parameters

### S

`S` *extends* `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

## Parameters

### schema

`S`

The schema to resolve.

### prefix

`string` \| `undefined`

Property prefix, e.g. `'server'` → `'server.port'`.

### resolver

[`SchemaConfigResolver`](../type-aliases/SchemaConfigResolver.md)

The property resolver.

## Returns

`output`\<`S`\> \| `undefined`

The parsed typed value.

## Throws

When the resolved values violate the schema.
