[**@ndigo/socket v0.0.1**](../../README.md)

***

[@ndigo/socket](../../README.md) / [message-store](../README.md) / QueueMessageStore

# Interface: QueueMessageStore

The store contract: append, ordered replay, retention pruning.

Every method rejects with a `RangeError` when the destination is not a
non-empty string (validated identically by every backend).

## Properties

### kind

> `readonly` **kind**: `string`

Backend identifier for observability/diagnostics
(e.g. `'in-memory'`, `'libsql'`, `'redis'`).

## Methods

### append()

> **append**(`message`): `Promise`\<[`StoredQueueMessage`](StoredQueueMessage.md)\>

Persist one message and return it with the store-issued `seq` and
`storedAt`. Applied in call order per destination. Rejects when the
message cannot be stored (the caller owns fail-closed behavior).

#### Parameters

##### message

`Omit`\<[`StoredQueueMessage`](StoredQueueMessage.md), `"seq"` \| `"storedAt"`\>

The message without store-issued fields.

#### Returns

`Promise`\<[`StoredQueueMessage`](StoredQueueMessage.md)\>

The stored message.

***

### dispose()?

> `optional` **dispose**(): `void` \| `Promise`\<`void`\>

Optional teardown: release the backend's resources. The store's
lifetime is the broker's, so an owner that shut a broker built with a
durable store down SHOULD call this at shutdown. Idempotent.

Backends document what a call after disposal does: the libsql backend
rejects later operations and closes only owned clients (injected
clients are borrowed by default); the in-memory backend forgets its
data and stays usable. Stop and drain producers before disposal.

#### Returns

`void` \| `Promise`\<`void`\>

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

[`QueueStoreRetention`](QueueStoreRetention.md)

The policy to enforce.

#### Returns

`Promise`\<`number`\>

How many messages were pruned.

***

### replay()

> **replay**(`destination`, `options?`): `Promise`\<[`StoredQueueMessage`](StoredQueueMessage.md)[]\>

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

`Promise`\<[`StoredQueueMessage`](StoredQueueMessage.md)[]\>

The matching messages, append-ordered.
