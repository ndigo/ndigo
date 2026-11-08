[**@ndigo/socket v0.0.1**](../../README.md)

***

[@ndigo/socket](../../README.md) / [message-store](../README.md) / InMemoryQueueMessageStore

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

Creates a store with the given retention bounds.

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

Store identifier (`'in-memory'`).

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

Appends one message to its destination's ring, evicting past the bounds.

#### Parameters

##### message

`Omit`\<[`StoredQueueMessage`](../interfaces/StoredQueueMessage.md), `"seq"` \| `"storedAt"`\>

The message payload (sequence and stored time are assigned here).

#### Returns

`Promise`\<[`StoredQueueMessage`](../interfaces/StoredQueueMessage.md)\>

The stored message with its assigned `seq` and `storedAt`.

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

Whether a destination currently retains messages.

#### Parameters

##### destination

`string`

The destination to check.

#### Returns

`Promise`\<`boolean`\>

`true` when the destination has a retained ring.

#### Implementation of

[`QueueMessageStore`](../interfaces/QueueMessageStore.md).[`has`](../interfaces/QueueMessageStore.md#has)

***

### prune()

> **prune**(`destination`, `retention`): `Promise`\<`number`\>

Applies a retention policy to one destination.

#### Parameters

##### destination

`string`

The destination to prune.

##### retention

[`QueueStoreRetention`](../interfaces/QueueStoreRetention.md)

TTL and count bounds.

#### Returns

`Promise`\<`number`\>

The number of pruned messages.

#### Implementation of

[`QueueMessageStore`](../interfaces/QueueMessageStore.md).[`prune`](../interfaces/QueueMessageStore.md#prune)

***

### replay()

> **replay**(`destination`, `options?`): `Promise`\<[`StoredQueueMessage`](../interfaces/StoredQueueMessage.md)[]\>

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

`Promise`\<[`StoredQueueMessage`](../interfaces/StoredQueueMessage.md)[]\>

The retained messages in sequence order.

#### Implementation of

[`QueueMessageStore`](../interfaces/QueueMessageStore.md).[`replay`](../interfaces/QueueMessageStore.md#replay)
