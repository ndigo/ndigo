[**@ndigo/orm-drizzle v0.0.1**](../../README.md)

***

[@ndigo/orm-drizzle](../../README.md) / [migration-loader](../README.md) / loadMigrations

# Function: loadMigrations()

> **loadMigrations**(`dir`): `Promise`\<[`Migration`](../../drizzle-migrator/interfaces/Migration.md)[]\>

Loads the migrations under `dir`, in filename order, as `Migration`s.

Versions come from each module's exported `version` (filenames are
cosmetic — renames break nothing); `DrizzleMigrator.migrate` re-validates
and orders them through `orderedMigrations`. Dynamic imports are cached by
the runtime, so one loader instance is expected per process per directory.

## Parameters

### dir

`string`

The migrations directory.

## Returns

`Promise`\<[`Migration`](../../drizzle-migrator/interfaces/Migration.md)[]\>

The loaded migrations, filename-sorted.
