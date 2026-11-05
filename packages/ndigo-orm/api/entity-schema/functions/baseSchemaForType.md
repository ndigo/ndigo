[**@ndigo/orm v0.0.1**](../../README.md)

***

[@ndigo/orm](../../README.md) / [entity-schema](../README.md) / baseSchemaForType

# Function: baseSchemaForType()

> **baseSchemaForType**(`type`): `ZodType`

Base Zod type for a declared SQL column type. Unknown/untyped columns pass
through unvalidated (`z.unknown`).

## Parameters

### type

`string`

The declared column `type` (e.g. `'varchar'`, `'int'`).

## Returns

`ZodType`

The base Zod schema, or `z.unknown` when no mapping applies.
