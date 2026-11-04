[**@ndigo/orm v0.0.1**](../README.md)

***

[@ndigo/orm](../README.md) / schemaForEntity

# Function: schemaForEntity()

> **schemaForEntity**\<`T`\>(`entityClass`): `ZodObject`\<`Record`\<`string`, `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>\>\>

Derives a Zod object schema for an entity class from its `@column` metadata.

## Type Parameters

### T

`T` *extends* `object`

## Parameters

### entityClass

`Constructable`\<`T`\>

The entity constructor (must be decorated with `@entity`).

## Returns

`ZodObject`\<`Record`\<`string`, `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>\>\>

A Zod object schema keyed by field name.
