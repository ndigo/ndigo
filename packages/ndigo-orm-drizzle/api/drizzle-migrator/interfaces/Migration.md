[**@ndigo/orm-drizzle v0.0.1**](../../README.md)

***

[@ndigo/orm-drizzle](../../README.md) / [drizzle-migrator](../README.md) / Migration

# Interface: Migration

A single versioned schema change. Versions are unique positive integers;
the runner applies them in ascending order regardless of input order.
`up` runs outside any explicit transaction. SQLite itself supports
transactional DDL, but a migration body may use `ctx.batch(...)`, and
libSQL runs a batch in its own implicit transaction: with an explicit
transaction open, that nested batch fails ("cannot start a transaction
within a transaction") and takes the outer transaction down with it.
Statements are therefore atomic individually — a single `execute`
autocommits, a `batch` is atomic as a group. A failing `up` leaves no
journal row, so the migration is retried on the next run; author
idempotent DDL (`IF NOT EXISTS` style) or restore from backup when a
migration fails partway.

## Properties

### description

> **description**: `string`

Human-readable summary recorded in the journal.

***

### up

> **up**: (`context`) => `void` \| `Promise`\<`unknown`\>

Applies the change; throw to roll it back. Return value is ignored.

#### Parameters

##### context

[`MigrationContext`](MigrationContext.md)

#### Returns

`void` \| `Promise`\<`unknown`\>

***

### version

> **version**: `number`

