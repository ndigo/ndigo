[**@ndigo/orm-drizzle v0.0.1**](../README.md)

***

[@ndigo/orm-drizzle](../README.md) / ProjectionDelta

# Interface: ProjectionDelta

The delta between two projections, as rendered for a migration.

## Properties

### description

> **description**: `string`

Human summary used as the migration description, e.g. `create table "notes"; drop column "old" from "notes"`.

***

### drops

> **drops**: `string`[]

The drop statements among [ProjectionDelta.statements](#statements) (also
listed there) — the destructive subset a generator may want to gate
behind explicit operator acknowledgment before emitting (REV-006).
Empty when the delta contains no drops.

***

### statements

> **statements**: `string`[]

SQL statements for the migration body (table creates first, then column changes, then drops).

***

### unsupported

> **unsupported**: `string`[]

Changes the predicate cannot express (type/nullability/PK changes, added PK columns) — hand-written SQL required.
