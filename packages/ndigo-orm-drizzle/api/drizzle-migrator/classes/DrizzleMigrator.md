[**@ndigo/orm-drizzle v0.0.1**](../../README.md)

***

[@ndigo/orm-drizzle](../../README.md) / [drizzle-migrator](../README.md) / DrizzleMigrator

# Class: DrizzleMigrator

Journaled, forward-only schema migration runner (AD-30).

`migrate()` applies every pending migration in ascending version order
and journals each application in `_ndigo_migrations`; `status()` reports
applied/pending over a migration list for boot logs and operator tooling.
Runs are idempotent: versions already present in the journal are skipped.

## Example

```ts
const migrator = new DrizzleMigrator(dataSource);
await migrator.migrate([
    { version: 1, description: 'initial schema', up: (ctx) => ctx.batch(createTableStatements([Note])) },
    { version: 2, description: 'add title column', up: (ctx) => ctx.execute('ALTER TABLE "notes" ADD COLUMN "title" TEXT') },
]);
```

## Constructors

### Constructor

> **new DrizzleMigrator**(`dataSource`): `DrizzleMigrator`

#### Parameters

##### dataSource

[`DrizzleDataSource`](../../drizzle-data-source/classes/DrizzleDataSource.md)

The data source whose connection the migrations
  and journal use. Targets local/file/memory SQLite. Do not call
  `migrate` from inside an open transaction on the same connection.

#### Returns

`DrizzleMigrator`

## Methods

### migrate()

> **migrate**(`migrations`): `Promise`\<`void`\>

Applies all pending migrations in ascending version order.

#### Parameters

##### migrations

[`Migration`](../interfaces/Migration.md)[]

The full migration history; input order is
  irrelevant. Duplicate or invalid versions fail loud before any SQL
  runs.

#### Returns

`Promise`\<`void`\>

A promise that resolves once all pending migrations apply.

***

### status()

> **status**(`migrations`): `Promise`\<[`MigrationStatus`](../interfaces/MigrationStatus.md)[]\>

Reports the applied/pending state of each migration, with the apply
timestamp when recorded. Ensures the journal exists.

#### Parameters

##### migrations

[`Migration`](../interfaces/Migration.md)[]

The full migration history.

#### Returns

`Promise`\<[`MigrationStatus`](../interfaces/MigrationStatus.md)[]\>

The status of every migration.
