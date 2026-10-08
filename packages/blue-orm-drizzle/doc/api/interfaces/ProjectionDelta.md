[**@blue/orm-drizzle v0.0.1**](../README.md)

***

[@blue/orm-drizzle](../README.md) / ProjectionDelta

# Interface: ProjectionDelta

The delta between two projections, as rendered for a migration.

## Properties

### description

> **description**: `string`

Human summary used as the migration description, e.g. `create table "notes"; drop column "old" from "notes"`.

***

### statements

> **statements**: `string`[]

SQL statements for the migration body (table creates first, then column changes, then drops).

***

### unsupported

> **unsupported**: `string`[]

Changes the predicate cannot express (type/nullability/PK changes, added PK columns) — hand-written SQL required.
