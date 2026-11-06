[**@ndigo/orm-drizzle v0.0.1**](../../README.md)

***

[@ndigo/orm-drizzle](../../README.md) / [schema-snapshot](../README.md) / diffProjections

# Function: diffProjections()

> **diffProjections**(`before`, `after`): [`ProjectionDelta`](../interfaces/ProjectionDelta.md)

Diffs a committed projection against the current one and renders the SQL
delta. A `null` `before` (no committed snapshot yet) renders every table
as a create. Column additions render `ALTER TABLE … ADD COLUMN` (except
added primary-key columns, which need a rebuild); dropped columns and
dropped tables render `ALTER TABLE … DROP COLUMN` / `DROP TABLE IF EXISTS`
(both also listed in `drops`, the destructive subset a generator
may gate behind explicit acknowledgment). Changes the predicate cannot
express — type, nullability, primary-key or generated-flag changes — go
to `unsupported`, never into the migration silently.

## Parameters

### before

[`SchemaSnapshot`](../interfaces/SchemaSnapshot.md) \| `null`

The committed projection, or `null` when none exists.

### after

[`SchemaSnapshot`](../interfaces/SchemaSnapshot.md)

The current projection (from `projectEntities`).

## Returns

[`ProjectionDelta`](../interfaces/ProjectionDelta.md)

The rendered delta.
