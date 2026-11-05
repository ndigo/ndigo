[**@ndigo/jobs v0.0.1**](../../README.md)

***

[@ndigo/jobs](../../README.md) / [in-process-outbox-store](../README.md) / InProcessOutboxStore

# Class: InProcessOutboxStore

Map-backed [OutboxStore](../../outbox/interfaces/OutboxStore.md) with the full claim/lease semantics but **no
transaction to join**: `append` succeeds unconditionally, so it is a test
double and development default, not a correctness guarantee (AD-72 D-6).
Entries vanish with the process.

## Since

1.0.0

## Implements

- [`OutboxStore`](../../outbox/interfaces/OutboxStore.md)

## Constructors

### Constructor

> **new InProcessOutboxStore**(`options?`): `InProcessOutboxStore`

#### Parameters

##### options?

[`InProcessOutboxStoreOptions`](../interfaces/InProcessOutboxStoreOptions.md) = `{}`

Clock/id overrides for deterministic tests.

#### Returns

`InProcessOutboxStore`

## Methods

### append()

> **append**(`input`): `Promise`\<[`OutboxEntry`](../../outbox/interfaces/OutboxEntry.md)\>

Records one side effect.

#### Parameters

##### input

Type and payload to record.

###### payload?

`unknown`

###### type

`string`

#### Returns

`Promise`\<[`OutboxEntry`](../../outbox/interfaces/OutboxEntry.md)\>

The stored entry (with id and `occurredAt`).

#### Implementation of

[`OutboxStore`](../../outbox/interfaces/OutboxStore.md).[`append`](../../outbox/interfaces/OutboxStore.md#append)

***

### claimPending()

> **claimPending**(`options?`): `Promise`\<[`OutboxEntry`](../../outbox/interfaces/OutboxEntry.md)[]\>

Leases up to `limit` unpublished entries whose lease is absent or
expired, in `occurredAt` order.

#### Parameters

##### options?

[`OutboxClaimOptions`](../../outbox/interfaces/OutboxClaimOptions.md) = `{}`

Claim window.

#### Returns

`Promise`\<[`OutboxEntry`](../../outbox/interfaces/OutboxEntry.md)[]\>

The claimed entries.

#### Implementation of

[`OutboxStore`](../../outbox/interfaces/OutboxStore.md).[`claimPending`](../../outbox/interfaces/OutboxStore.md#claimpending)

***

### close()

> **close**(): `Promise`\<`void`\>

Releases store resources (idempotent).

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`OutboxStore`](../../outbox/interfaces/OutboxStore.md).[`close`](../../outbox/interfaces/OutboxStore.md#close)

***

### markPublished()

> **markPublished**(`id`): `Promise`\<`void`\>

Marks an entry as published (terminal for relaying; may be retained).

#### Parameters

##### id

`string`

The entry identifier.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`OutboxStore`](../../outbox/interfaces/OutboxStore.md).[`markPublished`](../../outbox/interfaces/OutboxStore.md#markpublished)

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

[`OutboxStore`](../../outbox/interfaces/OutboxStore.md).[`prunePublished`](../../outbox/interfaces/OutboxStore.md#prunepublished)

***

### size()

> **size**(): `Promise`\<`number`\>

Number of unpublished entries.

#### Returns

`Promise`\<`number`\>

The pending count.

#### Implementation of

[`OutboxStore`](../../outbox/interfaces/OutboxStore.md).[`size`](../../outbox/interfaces/OutboxStore.md#size)
