[**@ndigo/orm-drizzle v0.0.1**](../../README.md)

***

[@ndigo/orm-drizzle](../../README.md) / [drizzle-migrator](../README.md) / MigrationStatus

# Interface: MigrationStatus

One row of migration state as reported by the migrator: the version, its
description, whether the journal records it as applied, and — when it is —
the ISO-8601 timestamp recorded at apply time.

## Properties

### appliedAt?

> `optional` **appliedAt?**: `string`

ISO-8601 timestamp recorded at apply time; present when `applied`.

***

### description

> **description**: `string`

***

### state

> **state**: [`MigrationState`](../type-aliases/MigrationState.md)

Whether the journal records this version as applied.

***

### version

> **version**: `number`

