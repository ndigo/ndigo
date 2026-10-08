[**@blue/orm-drizzle v0.0.1**](../README.md)

***

[@blue/orm-drizzle](../README.md) / migrateOnBoot

# Function: migrateOnBoot()

> **migrateOnBoot**(`options`): `Promise`\<[`MigrationStatus`](../interfaces/MigrationStatus.md)[]\>

Applies all pending migrations at boot, **failing closed**: any loader or
migration error throws before serving starts — a boot that skips pending
DDL would serve against a stale schema. Journal semantics are AD-30's:
idempotent across restarts, one runner at a time (concurrent migrators
fail loud on the journal primary key).

## Parameters

### options

[`MigrateOnBootOptions`](../interfaces/MigrateOnBootOptions.md)

The data source and migrations directory.

## Returns

`Promise`\<[`MigrationStatus`](../interfaces/MigrationStatus.md)[]\>

The post-run migration status, for boot logs.
