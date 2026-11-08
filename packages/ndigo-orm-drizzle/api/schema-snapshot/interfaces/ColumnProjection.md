[**@ndigo/orm-drizzle v0.0.1**](../../README.md)

***

[@ndigo/orm-drizzle](../../README.md) / [schema-snapshot](../README.md) / ColumnProjection

# Interface: ColumnProjection

One column as the DDL predicate models it. `nullable` is the resolved
nullability (`createTableStatements` semantics: explicit `nullable: true`
or a non-PK generated column, which `persist()` skips while undefined).

## Properties

### generated

> **generated**: `boolean`

Whether the column is generated.

***

### name

> **name**: `string`

The column name.

***

### nullable

> **nullable**: `boolean`

Whether the column allows nulls.

***

### primaryKey

> **primaryKey**: `boolean`

Whether the column is the primary key.

***

### type

> **type**: [`SqliteStorageType`](../type-aliases/SqliteStorageType.md)

The SQLite storage class.
