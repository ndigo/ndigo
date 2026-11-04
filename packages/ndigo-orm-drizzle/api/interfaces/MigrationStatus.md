[**@ndigo/orm-drizzle v0.0.1**](../README.md)

***

[@ndigo/orm-drizzle](../README.md) / MigrationStatus

# Interface: MigrationStatus

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
