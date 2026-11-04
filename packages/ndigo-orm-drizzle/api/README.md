**@ndigo/orm-drizzle v0.0.1**

***

# @ndigo/orm-drizzle v0.0.1

## Since

1.0.0

## Author

Jeff Rose

## Classes

- [DrizzleDataSource](classes/DrizzleDataSource.md)
- [DrizzleDerivedQueryRepository](classes/DrizzleDerivedQueryRepository.md)
- [DrizzleEntityManager](classes/DrizzleEntityManager.md)
- [DrizzleMigrator](classes/DrizzleMigrator.md)
- [DrizzleRepository](classes/DrizzleRepository.md)
- [DrizzleTransactionManager](classes/DrizzleTransactionManager.md)
- [DrizzleUnitOfWork](classes/DrizzleUnitOfWork.md)
- [LibSQLJobStore](classes/LibSQLJobStore.md)
- [LibSQLOutboxStore](classes/LibSQLOutboxStore.md)
- [LibSQLQueueMessageStore](classes/LibSQLQueueMessageStore.md)
- [LibSQLSessionStore](classes/LibSQLSessionStore.md)

## Interfaces

- [ColumnProjection](interfaces/ColumnProjection.md)
- [DrizzleDataSourceOptions](interfaces/DrizzleDataSourceOptions.md)
- [LibSQLJobStoreOptions](interfaces/LibSQLJobStoreOptions.md)
- [LibSQLOutboxStoreOptions](interfaces/LibSQLOutboxStoreOptions.md)
- [LibSQLQueueMessageStoreOptions](interfaces/LibSQLQueueMessageStoreOptions.md)
- [LibSQLSessionStoreOptions](interfaces/LibSQLSessionStoreOptions.md)
- [MigrateOnBootOptions](interfaces/MigrateOnBootOptions.md)
- [Migration](interfaces/Migration.md)
- [MigrationContext](interfaces/MigrationContext.md)
- [MigrationStatus](interfaces/MigrationStatus.md)
- [ProjectionDelta](interfaces/ProjectionDelta.md)
- [SchemaSnapshot](interfaces/SchemaSnapshot.md)
- [TableProjection](interfaces/TableProjection.md)

## Type Aliases

- [MigrationState](type-aliases/MigrationState.md)
- [SqliteStorageType](type-aliases/SqliteStorageType.md)

## Functions

- [createTableStatements](functions/createTableStatements.md)
- [diffProjections](functions/diffProjections.md)
- [drizzleTableForEntity](functions/drizzleTableForEntity.md)
- [insertSchemaForEntity](functions/insertSchemaForEntity.md)
- [loadMigrations](functions/loadMigrations.md)
- [migrateOnBoot](functions/migrateOnBoot.md)
- [nextMigrationVersion](functions/nextMigrationVersion.md)
- [projectEntities](functions/projectEntities.md)
- [readSnapshot](functions/readSnapshot.md)
- [renderMigrationFile](functions/renderMigrationFile.md)
- [renderSnapshot](functions/renderSnapshot.md)
- [selectSchemaForEntity](functions/selectSchemaForEntity.md)
