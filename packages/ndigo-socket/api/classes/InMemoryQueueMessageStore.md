[**@ndigo/socket v0.0.1**](../README.md)

***

[@ndigo/socket](../README.md) / InMemoryQueueMessageStore

# Class: InMemoryQueueMessageStore

The default [QueueMessageStore](../interfaces/QueueMessageStore.md): bounded in-memory rings, one per
destination — the same shape the broker's live backlog uses, so the
durable phase can swap the backing without changing delivery semantics.

Every bound is a drop-oldest watermark (matches the broker's fail-closed
posture): exceeding a bound never throws — it evicts. Eviction is
non-destructive to an in-flight `append`: a ring emptied by the count
guard stays attached so the pending write lands in it (COR-9), and a
ring that a budget drops whole takes its sequence counter with it, so
`#seqs` can never outgrow the destination cap (SEC-1).

## Implements

- [`QueueMessageStore`](../interfaces/QueueMessageStore.md)

## Constructors

### Constructor

> **new InMemoryQueueMessageStore**(`options?`): `InMemoryQueueMessageStore`

#### Parameters

##### options?

[`InMemoryQueueStoreOptions`](../interfaces/InMemoryQueueStoreOptions.md) = `{}`

Retained-message bounds. Defaults mirror the
  broker's backlog caps; `0`/`null` disables a bound.

#### Returns

`InMemoryQueueMessageStore`

## Properties

### kind

> `readonly` **kind**: `"in-memory"` = `'in-memory'`

Backend identifier for observability/diagnostics
(e.g. `'in-memory'`, `'libsql'`, `'redis'`).

#### Implementation of

[`QueueMessageStore`](../interfaces/QueueMessageStore.md).[`kind`](../interfaces/QueueMessageStore.md#kind)

## Accessors

### stats

#### Get Signature

> **get** **stats**(): [`InMemoryQueueStoreStats`](../interfaces/InMemoryQueueStoreStats.md)

Retained-destination, byte and sequence-counter totals (observability).

##### Returns

[`InMemoryQueueStoreStats`](../interfaces/InMemoryQueueStoreStats.md)

## Methods

### append()

> **append**(`message`): `Promise`\<[`StoredQueueMessage`](../interfaces/StoredQueueMessage.md)\>

Persist one message and return it with the store-issued `seq` and
`storedAt`. Applied in call order per destination. Rejects when the
message cannot be stored (the caller owns fail-closed behavior).

#### Parameters

##### message

`Omit`\<[`StoredQueueMessage`](../interfaces/StoredQueueMessage.md), `"seq"` \| `"storedAt"`\>

The message without store-issued fields.

#### Returns

`Promise`\<[`StoredQueueMessage`](../interfaces/StoredQueueMessage.md)\>

The stored message.

#### Implementation of

[`QueueMessageStore`](../interfaces/QueueMessageStore.md).[`append`](../interfaces/QueueMessageStore.md#append)

***

### dispose()

> **dispose**(): `void`

Forget every retained message and destination — the shutdown path.
The store stays usable afterwards: the next `append` starts a fresh
ring (and `seq` at 1). Idempotent.

#### Returns

`void`

#### Implementation of

[`QueueMessageStore`](../interfaces/QueueMessageStore.md).[`dispose`](../interfaces/QueueMessageStore.md#dispose)

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

[`QueueMessageStore`](../interfaces/QueueMessageStore.md).[`has`](../interfaces/QueueMessageStore.md#has)

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

[`QueueStoreRetention`](../interfaces/QueueStoreRetention.md)

The policy to enforce.

#### Returns

`Promise`\<`number`\>

How many messages were pruned.

#### Implementation of

[`QueueMessageStore`](../interfaces/QueueMessageStore.md).[`prune`](../interfaces/QueueMessageStore.md#prune)

***

### replay()

> **replay**(`destination`, `options?`): `Promise`\<[`StoredQueueMessage`](../interfaces/StoredQueueMessage.md)[]\>

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

`Promise`\<[`StoredQueueMessage`](../interfaces/StoredQueueMessage.md)[]\>

The matching messages, append-ordered.

#### Implementation of

[`QueueMessageStore`](../interfaces/QueueMessageStore.md).[`replay`](../interfaces/QueueMessageStore.md#replay)
