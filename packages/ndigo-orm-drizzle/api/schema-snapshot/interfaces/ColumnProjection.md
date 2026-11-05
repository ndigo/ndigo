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

***

### name

> **name**: `string`

***

### nullable

> **nullable**: `boolean`

***

### primaryKey

> **primaryKey**: `boolean`

***

### type

> **type**: [`SqliteStorageType`](../type-aliases/SqliteStorageType.md)

