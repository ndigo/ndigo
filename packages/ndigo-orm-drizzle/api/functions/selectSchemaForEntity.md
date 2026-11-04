[**@ndigo/orm-drizzle v0.0.1**](../README.md)

***

[@ndigo/orm-drizzle](../README.md) / selectSchemaForEntity

# Function: selectSchemaForEntity()

> **selectSchemaForEntity**\<`E`\>(`entityClass`): `ZodType`

Derives a Zod **select** schema (the entity's readable shape) from a Drizzle
table built from entity metadata.

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
