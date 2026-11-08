[**@ndigo/orm-drizzle v0.0.1**](../../README.md)

***

[@ndigo/orm-drizzle](../../README.md) / [libsql-outbox-store](../README.md) / LibSQLOutboxStore

# Class: LibSQLOutboxStore

Durable [OutboxStore](#) on libSQL. Every method awaits schema creation;
clients created by the store are owned, injected clients are borrowed by
default.

## Implements

- [`OutboxStore`](#)

## Constructors

### Constructor

> **new LibSQLOutboxStore**(`options?`): `LibSQLOutboxStore`

#### Parameters

##### options?

[`LibSQLOutboxStoreOptions`](../interfaces/LibSQLOutboxStoreOptions.md) = `{}`

The data-source client (recommended), or url/authToken
  to create an owned client (url defaults to `':memory:'`).

#### Returns

`LibSQLOutboxStore`

## Methods

### append()

> **append**(`input`): `Promise`\<`OutboxEntry`\>

Records one side effect.

#### Parameters

##### input

Type and payload to record.

###### payload?

`unknown`

###### type

`string`

#### Returns

`Promise`\<`OutboxEntry`\>

The stored entry.

#### Implementation of

`OutboxStore.append`

***

### claimPending()

> **claimPending**(`options?`): `Promise`\<`OutboxEntry`[]\>

Leases up to `limit` unpublished entries.

#### Parameters

##### options?

`OutboxClaimOptions` = `{}`

Claim window.

#### Returns

`Promise`\<`OutboxEntry`[]\>

The claimed entries.

#### Implementation of

`OutboxStore.claimPending`

***

### close()

> **close**(): `Promise`\<`void`\>

Release this store. Idempotent; closes only owned clients. Later
operations reject with a disposed-store error, including when the
client is borrowed. Pending operations are not drained; stop the relay
first.

#### Returns

`Promise`\<`void`\>

#### Implementation of

`OutboxStore.close`

***

### markPublished()

> **markPublished**(`id`): `Promise`\<`void`\>

Marks an entry as published.

#### Parameters

##### id

`string`

The entry identifier.

#### Returns

`Promise`\<`void`\>

A promise that resolves once marked.

#### Implementation of

`OutboxStore.markPublished`

***

### prunePublished()

> **prunePublished**(`olderThanMs`): `Promise`\<`number`\>

Deletes published entries older than the given age.

#### Parameters

##### olderThanMs

`number`

Age in milliseconds.

#### Returns

`Promise`\<`number`\>

Number of pruned entries.

#### Implementation of

`OutboxStore.prunePublished`

***

### size()

> **size**(): `Promise`\<`number`\>

Number of unpublished entries.

#### Returns

`Promise`\<`number`\>

The pending count.

#### Implementation of

`OutboxStore.size`
