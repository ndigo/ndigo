[**@blue/orm-drizzle v0.0.1**](../README.md)

***

[@blue/orm-drizzle](../README.md) / renderMigrationFile

# Function: renderMigrationFile()

> **renderMigrationFile**(`version`, `description`, `statements`): `string`

Renders a versioned migration module (`db/migrations/<NNNN>-<slug>.ts`) —
the artifact `blue db generate` commits. Statements and the description
are emitted as single-quoted literals when the content contains no single
quote (the oxfmt-stable form — the freshness gate regenerates and diffs,
so the emitter must survive `oxfmt --check` byte-identically); content
with single quotes falls back to JSON double-quoted literals.

## Parameters

### version

`number`

The migration version (next after the committed highest).

### description

`string`

Human summary (from `diffProjections`).

### statements

`string`[]

The migration body's SQL statements.

## Returns

`string`

The migration module source.
