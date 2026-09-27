[**@blue/orm-drizzle v0.0.1**](../README.md)

***

[@blue/orm-drizzle](../README.md) / LibSQLQueueMessageStore

# Class: LibSQLQueueMessageStore

Durable `/queue` backend on libsql. One instance owns one connection;
every method awaits a lazily-created schema. Multi-writer processes on
one database are safe by virtue of atomic AUTOINCREMENT — seq issuance
is a single INSERT.

## Implements

- `QueueMessageStore`

## Constructors

### Constructor

> **new LibSQLQueueMessageStore**(`options?`): `LibSQLQueueMessageStore`

#### Parameters

##### options?

[`LibSQLQueueMessageStoreOptions`](../interfaces/LibSQLQueueMessageStoreOptions.md) = `{}`

A shared client, or url/authToken to create one
  (url defaults to `':memory:'`, matching `DrizzleDataSource`).

#### Returns

`LibSQLQueueMessageStore`

## Properties

### kind

> `readonly` **kind**: `"libsql"` = `'libsql'`

Backend identifier for observability/diagnostics
(e.g. `'in-memory'`, `'libsql'`, `'redis'`).

#### Implementation of

`QueueMessageStore.kind`

## Methods

### append()

> **append**(`message`): `Promise`\<`StoredQueueMessage`\>

Persist one message and return it with the store-issued `seq` and
`storedAt`. Applied in call order per destination. Rejects when the
message cannot be stored (the caller owns fail-closed behavior).

#### Parameters

##### message

`Omit`\<`StoredQueueMessage`, `"seq"` \| `"storedAt"`\>

The message without store-issued fields.

#### Returns

`Promise`\<`StoredQueueMessage`\>

The stored message.

#### Implementation of

`QueueMessageStore.append`

***

### dispose()

> **dispose**(): `void`

Close the libsql connection (this store owns its lifetime). Idempotent;
every later operation rejects with the client's `CLIENT_CLOSED` error.
A store constructed with an injected `client` closes that shared
client too.

#### Returns

`void`

#### Implementation of

`QueueMessageStore.dispose`

***

### has()

> **has**(`destination`): `Promise`\<`boolean`\>

Whether a destination exists (has live or retained messages).

#### Parameters

##### destination

`string`

The `/queue/<name>` destination.

#### Returns

`Promise`\<`boolean`\>

Whether the destination is known to the store.

#### Implementation of

`QueueMessageStore.has`

***

### prune()

> **prune**(`destination`, `retention`): `Promise`\<`number`\>

Enforce retention on one destination, dropping the oldest messages
past the TTL and/or count bound. The TTL boundary is inclusive: a
message whose age is exactly `ttlMs` is expired. Idempotent; safe to
call on any cadence.

#### Parameters

##### destination

`string`

The `/queue/<name>` destination.

##### retention

The policy to enforce.

###### maxMessages?

`number`

###### ttlMs?

`number`

#### Returns

`Promise`\<`number`\>

How many messages were pruned.

#### Implementation of

`QueueMessageStore.prune`

***

### replay()

> **replay**(`destination`, `options?`): `Promise`\<`StoredQueueMessage`[]\>

Replay a destination's messages, oldest first (ascending `seq`,
newest last). `afterSeq` resumes after a gap (crash recovery);
`limit` bounds the window to the newest `limit` messages (history
length) — absent, `NaN` or `+Infinity` means the whole window, and
negative values clamp to `0` (empty).

#### Parameters

##### destination

`string`

The `/queue/<name>` destination.

##### options?

Replay window.

###### afterSeq?

`number`

###### limit?

`number`

#### Returns

`Promise`\<`StoredQueueMessage`[]\>

The matching messages, append-ordered.

#### Implementation of

`QueueMessageStore.replay`
