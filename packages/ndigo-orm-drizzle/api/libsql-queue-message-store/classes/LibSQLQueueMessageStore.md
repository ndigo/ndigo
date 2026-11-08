[**@ndigo/orm-drizzle v0.0.1**](../../README.md)

***

[@ndigo/orm-drizzle](../../README.md) / [libsql-queue-message-store](../README.md) / LibSQLQueueMessageStore

# Class: LibSQLQueueMessageStore

Durable `/queue` backend on libsql. Every method awaits schema creation.
Multi-writer processes on one database are safe by virtue of atomic
AUTOINCREMENT — seq issuance is a single INSERT. Clients created by the
store are owned; injected clients are borrowed by default.

## Implements

- `QueueMessageStore`

## Constructors

### Constructor

> **new LibSQLQueueMessageStore**(`options?`): `LibSQLQueueMessageStore`

#### Parameters

##### options?

[`LibSQLQueueMessageStoreOptions`](../interfaces/LibSQLQueueMessageStoreOptions.md) = `{}`

A borrowed client, or url/authToken to create an owned
  client (url defaults to `':memory:'`, matching `DrizzleDataSource`).

#### Returns

`LibSQLQueueMessageStore`

## Properties

### kind

> `readonly` **kind**: `"libsql"` = `'libsql'`

Store identifier (`'libsql'`).

#### Implementation of

`QueueMessageStore.kind`

## Methods

### append()

> **append**(`message`): `Promise`\<`StoredQueueMessage`\>

Appends one message to its destination.

#### Parameters

##### message

`Omit`\<`StoredQueueMessage`, `"seq"` \| `"storedAt"`\>

The message payload (sequence and stored time are assigned here).

#### Returns

`Promise`\<`StoredQueueMessage`\>

The stored message.

#### Implementation of

`QueueMessageStore.append`

***

### dispose()

> **dispose**(): `void`

Release this store. Idempotent; closes only owned clients. Later
operations reject with a disposed-store error, including when the
client is borrowed. Pending operations are not drained; callers must
stop and drain the broker first.

#### Returns

`void`

#### Implementation of

`QueueMessageStore.dispose`

***

### has()

> **has**(`destination`): `Promise`\<`boolean`\>

Whether a destination currently retains messages.

#### Parameters

##### destination

`string`

The destination to check.

#### Returns

`Promise`\<`boolean`\>

`true` when the destination has retained messages.

#### Implementation of

`QueueMessageStore.has`

***

### prune()

> **prune**(`destination`, `retention`): `Promise`\<`number`\>

Applies a retention policy to one destination.

#### Parameters

##### destination

`string`

The destination to prune.

##### retention

TTL and count bounds.

###### maxMessages?

`number`

###### ttlMs?

`number`

#### Returns

`Promise`\<`number`\>

The number of pruned messages.

#### Implementation of

`QueueMessageStore.prune`

***

### replay()

> **replay**(`destination`, `options?`): `Promise`\<`StoredQueueMessage`[]\>

Replays retained messages after a sequence cursor.

#### Parameters

##### destination

`string`

The destination to replay.

##### options?

Sequence cursor and result limit.

###### afterSeq?

`number`

###### limit?

`number`

#### Returns

`Promise`\<`StoredQueueMessage`[]\>

The retained messages in sequence order.

#### Implementation of

`QueueMessageStore.replay`
