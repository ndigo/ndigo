[**@ndigo/orm-drizzle v0.0.1**](../../README.md)

***

[@ndigo/orm-drizzle](../../README.md) / [libsql-outbox-store](../README.md) / LibSQLOutboxStore

# Class: LibSQLOutboxStore

Durable [OutboxStore](#) on libSQL. Every method awaits schema creation;
clients created by the store are owned, injected clients are borrowed by
default.

## Since

1.0.0

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

#### Parameters

##### input

###### payload?

`unknown`

###### type

`string`

#### Returns

`Promise`\<`OutboxEntry`\>

#### Inherit Doc

#### Implementation of

`OutboxStore.append`

***

### claimPending()

> **claimPending**(`options?`): `Promise`\<`OutboxEntry`[]\>

#### Parameters

##### options?

`OutboxClaimOptions` = `{}`

#### Returns

`Promise`\<`OutboxEntry`[]\>

#### Inherit Doc

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

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

#### Inherit Doc

#### Implementation of

`OutboxStore.markPublished`

***

### prunePublished()

> **prunePublished**(`olderThanMs`): `Promise`\<`number`\>

#### Parameters

##### olderThanMs

`number`

#### Returns

`Promise`\<`number`\>

#### Inherit Doc

#### Implementation of

`OutboxStore.prunePublished`

***

### size()

> **size**(): `Promise`\<`number`\>

#### Returns

`Promise`\<`number`\>

#### Inherit Doc

#### Implementation of

`OutboxStore.size`
