[**@ndigo/context v0.0.1**](../README.md)

***

[@ndigo/context](../README.md) / parseSchemaConfig

# Function: parseSchemaConfig()

> **parseSchemaConfig**\<`S`\>(`schema`, `raw`): `output`\<`S`\>

Parses pre-gathered raw values through the schema, applying coercion and
defaults. Throws the zod `ZodError` on invalid input — callers decide the
failure framing (ndigo-boot wraps it in the fail-loud `IllegalStateError`
naming the config class; `typedConfig` lets it propagate).

## Type Parameters

### S

`S` *extends* `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

## Parameters

### schema

`S`

The binding schema (a `z.object` shape or a top-level
  scalar schema for `resolveSchemaConfig`'s leaf mode).

### raw

`Record`\<`string`, `unknown`\>

The resolved raw values, keyed by schema key.

## Returns

`output`\<`S`\>

The parsed, typed value.
