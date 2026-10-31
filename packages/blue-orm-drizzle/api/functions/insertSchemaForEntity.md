[**@blue/orm-drizzle v0.0.1**](../README.md)

***

[@blue/orm-drizzle](../README.md) / insertSchemaForEntity

# Function: insertSchemaForEntity()

> **insertSchemaForEntity**\<`E`\>(`entityClass`): `ZodType`

Derives a Zod **insert** schema (the entity's writable shape) from a
Drizzle table built from entity metadata.

## Type Parameters

### E

`E` *extends* `object`

## Parameters

### entityClass

`Constructable`\<`E`\>

The `@entity`-decorated class.

## Returns

`ZodType`

A Zod schema.
