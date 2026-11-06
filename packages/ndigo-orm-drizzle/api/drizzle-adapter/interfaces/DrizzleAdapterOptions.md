[**@ndigo/orm-drizzle v0.0.1**](../../README.md)

***

[@ndigo/orm-drizzle](../../README.md) / [drizzle-adapter](../README.md) / DrizzleAdapterOptions

# Interface: DrizzleAdapterOptions

## Properties

### dataSource

> **dataSource**: [`DrizzleDataSource`](../../drizzle-data-source/classes/DrizzleDataSource.md)

The data source whose connection the migrations use.

***

### generate?

> `optional` **generate?**: () => `Promise`\<`void`\>

App-owned generator (entities → migration file + schema.json).

#### Returns

`Promise`\<`void`\>

***

### migrations

> **migrations**: [`Migration`](../../drizzle-migrator/interfaces/Migration.md)[]

Full migration history (input order irrelevant).

***

### name

> **name**: `string`

Adapter name used for `--db <name>` selection.

***

### pull?

> `optional` **pull?**: () => `Promise`\<`void`\>

App-owned pull (DB → schema).

#### Returns

`Promise`\<`void`\>

***

### push?

> `optional` **push?**: () => `Promise`\<`void`\>

App-owned push (schema → DB).

#### Returns

`Promise`\<`void`\>

***

### rollback?

> `optional` **rollback?**: (`count?`) => `Promise`\<`void`\>

Rollback implementation.

#### Parameters

##### count?

`number`

#### Returns

`Promise`\<`void`\>

***

### seed?

> `optional` **seed?**: () => `Promise`\<`void`\>

App-owned seed routine.

#### Returns

`Promise`\<`void`\>

***

### studio?

> `optional` **studio?**: () => `Promise`\<`void`\>

App-owned studio launcher.

#### Returns

`Promise`\<`void`\>
