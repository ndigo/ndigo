[**@ndigo/orm-drizzle v0.0.1**](../../README.md)

***

[@ndigo/orm-drizzle](../../README.md) / [schema-snapshot](../README.md) / renderCreateTable

# Function: renderCreateTable()

> **renderCreateTable**(`table`): `string`

Renders a table's `CREATE TABLE` statement from its projection — the
projection-side mirror of `createTableStatements`, kept byte-identical by
the parity spec (`test/schema-snapshot.spec.ts`).

## Parameters

### table

[`TableProjection`](../interfaces/TableProjection.md)

The table projection.

## Returns

`string`

The `CREATE TABLE IF NOT EXISTS` statement.
