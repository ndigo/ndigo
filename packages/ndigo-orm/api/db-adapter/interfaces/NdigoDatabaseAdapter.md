[**@ndigo/orm v0.0.1**](../../README.md)

***

[@ndigo/orm](../../README.md) / [db-adapter](../README.md) / NdigoDatabaseAdapter

# Interface: NdigoDatabaseAdapter

Engine-agnostic database adapter used by `ndigo db *`.

## Properties

### engine

> `readonly` **engine**: `string`

Human-readable engine label, e.g. "Drizzle (libSQL)".

***

### name

> `readonly` **name**: `string`

Stable, unique name used for selection (`--db <name>`).

## Methods

### close()?

> `optional` **close**(): `Promise`\<`void`\>

Close connections / release resources.

#### Returns

`Promise`\<`void`\>

***

### generate()

> **generate**(): `Promise`\<`void`\>

Generate the next migration from entity metadata.

#### Returns

`Promise`\<`void`\>

***

### migrate()

> **migrate**(): `Promise`\<`void`\>

Apply pending migrations.

#### Returns

`Promise`\<`void`\>

***

### pull()?

> `optional` **pull**(): `Promise`\<`void`\>

Pull schema from the database into entity metadata.

#### Returns

`Promise`\<`void`\>

***

### push()?

> `optional` **push**(): `Promise`\<`void`\>

Push schema directly to the database (dev convenience).

#### Returns

`Promise`\<`void`\>

***

### rollback()?

> `optional` **rollback**(`count?`): `Promise`\<`void`\>

Roll back the last (or N) applied migration.

#### Parameters

##### count?

`number`

#### Returns

`Promise`\<`void`\>

***

### seed()?

> `optional` **seed**(): `Promise`\<`void`\>

Run seed data.

#### Returns

`Promise`\<`void`\>

***

### status()

> **status**(): `Promise`\<[`MigrationStatus`](../type-aliases/MigrationStatus.md)[]\>

Report applied/pending migration state.

#### Returns

`Promise`\<[`MigrationStatus`](../type-aliases/MigrationStatus.md)[]\>

***

### studio()?

> `optional` **studio**(): `Promise`\<`void`\>

Launch an interactive database browser.

#### Returns

`Promise`\<`void`\>
