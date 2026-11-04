[**@ndigo/jobs v0.0.1**](../README.md)

***

[@ndigo/jobs](../README.md) / InProcessOutboxStore

# Class: InProcessOutboxStore

Map-backed [OutboxStore](../interfaces/OutboxStore.md) with the full claim/lease semantics but **no
transaction to join**: `append` succeeds unconditionally, so it is a test
double and development default, not a correctness guarantee (AD-72 D-6).
Entries vanish with the process.

## Since

1.0.0

## Implements

- [`OutboxStore`](../interfaces/OutboxStore.md)

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

> **append**(`input`): `Promise`\<[`OutboxEntry`](../interfaces/OutboxEntry.md)\>

Records one side effect.

#### Parameters

##### input

Type and payload to record.

###### payload?

`unknown`

###### type

`string`

#### Returns

`Promise`\<[`OutboxEntry`](../interfaces/OutboxEntry.md)\>

The stored entry (with id and `occurredAt`).

#### Implementation of

[`OutboxStore`](../interfaces/OutboxStore.md).[`append`](../interfaces/OutboxStore.md#append)

***

### claimPending()

> **claimPending**(`options?`): `Promise`\<[`OutboxEntry`](../interfaces/OutboxEntry.md)[]\>

Leases up to `limit` unpublished entries whose lease is absent or
expired, in `occurredAt` order.

#### Parameters

##### options?

[`OutboxClaimOptions`](../interfaces/OutboxClaimOptions.md) = `{}`

Claim window.

#### Returns

`Promise`\<[`OutboxEntry`](../interfaces/OutboxEntry.md)[]\>

The claimed entries.

#### Implementation of

[`OutboxStore`](../interfaces/OutboxStore.md).[`claimPending`](../interfaces/OutboxStore.md#claimpending)

***

### close()

> **close**(): `Promise`\<`void`\>

Releases store resources (idempotent).

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`OutboxStore`](../interfaces/OutboxStore.md).[`close`](../interfaces/OutboxStore.md#close)

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

[`OutboxStore`](../interfaces/OutboxStore.md).[`markPublished`](../interfaces/OutboxStore.md#markpublished)

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

[`OutboxStore`](../interfaces/OutboxStore.md).[`prunePublished`](../interfaces/OutboxStore.md#prunepublished)

***

### size()

> **size**(): `Promise`\<`number`\>

Number of unpublished entries.

#### Returns

`Promise`\<`number`\>

The pending count.

#### Implementation of

[`OutboxStore`](../interfaces/OutboxStore.md).[`size`](../interfaces/OutboxStore.md#size)
