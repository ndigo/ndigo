[**@ndigo/orm-drizzle v0.0.1**](../README.md)

***

[@ndigo/orm-drizzle](../README.md) / MigrationContext

# Interface: MigrationContext

The SQL surface available to a migration, backed by the data source's
libSQL client.

## Methods

### batch()

> **batch**(`statements`): `Promise`\<`unknown`\>

Executes multiple statements in one round trip (schema DDL batches).

#### Parameters

##### statements

`string`[]

#### Returns

`Promise`\<`unknown`\>

***

### execute()

> **execute**(`sql`, `args?`): `Promise`\<`unknown`\>

Executes a single statement (DDL or DML) with optional positional args.

#### Parameters

##### sql

`string`

##### args?

`unknown`[]

#### Returns

`Promise`\<`unknown`\>
