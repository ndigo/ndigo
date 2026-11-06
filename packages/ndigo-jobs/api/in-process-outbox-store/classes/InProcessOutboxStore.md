[**@ndigo/jobs v0.0.1**](../../README.md)

***

[@ndigo/jobs](../../README.md) / [in-process-outbox-store](../README.md) / InProcessOutboxStore

# Class: InProcessOutboxStore

Map-backed [OutboxStore](../../outbox/interfaces/OutboxStore.md) with the full claim/lease semantics but **no
transaction to join**: `append` succeeds unconditionally, so it is a test
double and development default, not a correctness guarantee (AD-72 D-6).
Entries vanish with the process.

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

#### Parameters

##### input

###### payload?

`unknown`

###### type

`string`

#### Returns

`Promise`\<[`OutboxEntry`](../../outbox/interfaces/OutboxEntry.md)\>

#### Implementation of

[`OutboxStore`](../../outbox/interfaces/OutboxStore.md).[`append`](../../outbox/interfaces/OutboxStore.md#append)

***

### claimPending()

> **claimPending**(`options?`): `Promise`\<[`OutboxEntry`](../../outbox/interfaces/OutboxEntry.md)[]\>

#### Parameters

##### options?

[`OutboxClaimOptions`](../../outbox/interfaces/OutboxClaimOptions.md) = `{}`

#### Returns

`Promise`\<[`OutboxEntry`](../../outbox/interfaces/OutboxEntry.md)[]\>

#### Implementation of

[`OutboxStore`](../../outbox/interfaces/OutboxStore.md).[`claimPending`](../../outbox/interfaces/OutboxStore.md#claimpending)

***

### close()

> **close**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`OutboxStore`](../../outbox/interfaces/OutboxStore.md).[`close`](../../outbox/interfaces/OutboxStore.md#close)

***

### markPublished()

> **markPublished**(`id`): `Promise`\<`void`\>

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`OutboxStore`](../../outbox/interfaces/OutboxStore.md).[`markPublished`](../../outbox/interfaces/OutboxStore.md#markpublished)

***

### prunePublished()

> **prunePublished**(`olderThanMs`): `Promise`\<`number`\>

#### Parameters

##### olderThanMs

`number`

#### Returns

`Promise`\<`number`\>

#### Implementation of

[`OutboxStore`](../../outbox/interfaces/OutboxStore.md).[`prunePublished`](../../outbox/interfaces/OutboxStore.md#prunepublished)

***

### size()

> **size**(): `Promise`\<`number`\>

#### Returns

`Promise`\<`number`\>

#### Implementation of

[`OutboxStore`](../../outbox/interfaces/OutboxStore.md).[`size`](../../outbox/interfaces/OutboxStore.md#size)
