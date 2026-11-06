[**@ndigo/jobs v0.0.1**](../../README.md)

***

[@ndigo/jobs](../../README.md) / [outbox](../README.md) / OutboxStore

# Interface: OutboxStore

Durable store for outbox entries (AD-72 D-6).

The defining property is **transactional append**: when the backend is
transactional (e.g. `LibSQLOutboxStore` sharing the data source's client),
`append` called inside `@transactional` joins the caller's transaction —
commit publishes, rollback discards. Entry payloads follow the same
JSON-serializability contract as job payloads.

Publication is at-least-once: a claimed entry becomes claimable again after
its lease expires (crashed relay, failed publish), so consumers subscribe
idempotently.

## Since

1.0.0

## Extends

- `AsyncCloseable`

## Methods

### append()

> **append**(`entry`): `Promise`\<[`OutboxEntry`](OutboxEntry.md)\>

Records one side effect.

#### Parameters

##### entry

Type and payload to record.

###### payload?

`unknown`

###### type

`string`

#### Returns

`Promise`\<[`OutboxEntry`](OutboxEntry.md)\>

The stored entry (with id and `occurredAt`).

***

### claimPending()

> **claimPending**(`options?`): `Promise`\<[`OutboxEntry`](OutboxEntry.md)[]\>

Leases up to `limit` unpublished entries whose lease is absent or
expired, in `occurredAt` order.

#### Parameters

##### options?

[`OutboxClaimOptions`](OutboxClaimOptions.md)

Claim window.

#### Returns

`Promise`\<[`OutboxEntry`](OutboxEntry.md)[]\>

The claimed entries.

***

### close()

> **close**(): `Promise`\<`void`\>

Releases store resources (idempotent).

#### Returns

`Promise`\<`void`\>

#### Overrides

`AsyncCloseable.close`

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

***

### size()

> **size**(): `Promise`\<`number`\>

Number of unpublished entries.

#### Returns

`Promise`\<`number`\>

The pending count.
