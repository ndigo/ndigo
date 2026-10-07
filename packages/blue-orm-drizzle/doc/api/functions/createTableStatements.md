[**@blue/orm-drizzle v0.0.1**](../README.md)

***

[@blue/orm-drizzle](../README.md) / createTableStatements

# Function: createTableStatements()

> **createTableStatements**(`entities`): `string`[]

Generates the `CREATE TABLE IF NOT EXISTS` statements for the given
entities' metadata — the single source of truth for metadata → DDL, shared
by [DrizzleDataSource.init](../classes/DrizzleDataSource.md#init) (fresh-DB auto-init) and baseline
migrations (AD-30 D-3).

Column storage types follow the shared metadata → SQLite mapping:
`int*` → `INTEGER`, `real`/`float`/`double` → `REAL`, `blob` → `BLOB`,
everything else → `TEXT`. A primary key derives its storage class from the
declared column type; an undeclared generated key stays `INTEGER`
(auto-increment) and an undeclared caller-assigned key is `NUMERIC`, so
both string and numeric keys round-trip. `AUTOINCREMENT` is only emitted
for generated `INTEGER` keys. Non-PK `@generated` columns are emitted
nullable, because `persist()` skips them while undefined (DAT-F3).

## Parameters

### entities

`Constructable`[]

The entity classes declared with `@blue/orm` decorators.

## Returns

`string`[]

One statement per entity with declared columns; entities with no
  columns contribute nothing.
