[**@blue/orm-drizzle v0.0.1**](../README.md)

***

[@blue/orm-drizzle](../README.md) / drizzleTableForEntity

# Function: drizzleTableForEntity()

> **drizzleTableForEntity**\<`E`\>(`entityClass`): `SQLiteTableWithColumns`\<\{ \}\>

Maps an entity class to a Drizzle `sqliteTable`.

Column SQL types from `@column({ type })` map to sqlite-core builders:
`int*` → `integer`, `real`/`float`/`double` → `real`, `blob` → `blob`,
everything else → `text`. The primary key is marked
`primaryKey({ autoIncrement })` when the entity declares a generated
column.

## Type Parameters

### E

`E` *extends* `object`

## Parameters

### entityClass

`Constructable`\<`E`\>

The `@entity`-decorated class.

## Returns

`SQLiteTableWithColumns`\<\{ \}\>

A Drizzle sqlite table.
