[**@blue/orm v0.0.1**](../README.md)

***

[@blue/orm](../README.md) / insertSchemaForEntity

# Function: insertSchemaForEntity()

> **insertSchemaForEntity**\<`T`\>(`entityClass`): `ZodObject`\<`Record`\<`string`, `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>\>\>

Derives a Zod **insert** schema for an entity: the writable shape for a new
row. Identical to [schemaForEntity](schemaForEntity.md) except that the primary key and
any `@generated()` columns are omitted — the database owns them, so a
client-created payload must not carry (or be required to carry) them.

Use this for request-body validation of create endpoints:

```ts
@postMapping('/')
@parameters({ note: validatedBody(insertSchemaForEntity(Note)) })
create(note: z.infer<ReturnType<typeof insertSchemaForEntity<Note>>>) { … }
```

## Type Parameters

### T

`T` *extends* `object`

## Parameters

### entityClass

`Constructable`\<`T`\>

The entity constructor (must be decorated with `@entity`).

## Returns

`ZodObject`\<`Record`\<`string`, `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>\>\>

A Zod object schema over the writable columns.
