[**@blue/orm-drizzle v0.0.1**](../README.md)

***

[@blue/orm-drizzle](../README.md) / createTableStatements

# Function: createTableStatements()

> **createTableStatements**(`entities`): `string`[]

Generates the `CREATE TABLE IF NOT EXISTS` statements for the given
entities' metadata — the single source of truth for metadata → DDL, shared
by [DrizzleDataSource.init](../classes/DrizzleDataSource.md#init) (fresh-DB auto-init) and baseline
migrations (AD-30 D-3).

## Parameters

### entities

`Constructable`[]

The entity classes declared with `@blue/orm` decorators.

## Returns

`string`[]

One statement per entity with declared columns; entities with no
  columns contribute nothing.
