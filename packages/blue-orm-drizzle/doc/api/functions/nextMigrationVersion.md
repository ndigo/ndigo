[**@blue/orm-drizzle v0.0.1**](../README.md)

***

[@blue/orm-drizzle](../README.md) / nextMigrationVersion

# Function: nextMigrationVersion()

> **nextMigrationVersion**(`dir`): `Promise`\<`number`\>

The next free migration version under `dir` — one past the highest
`NNNN`-prefixed filename (a missing directory counts as empty, so
scaffolding works before anything exists).

## Parameters

### dir

`string`

The migrations directory.

## Returns

`Promise`\<`number`\>

The next version (1 for an empty or missing directory).
