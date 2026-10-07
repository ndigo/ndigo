[**@blue/jobs v0.0.1**](../README.md)

***

[@blue/jobs](../README.md) / OutboxRelayOptions

# Interface: OutboxRelayOptions

Options for [OutboxRelay](../classes/OutboxRelay.md).

## Since

1.0.0

## Properties

### batchSize?

> `optional` **batchSize?**: `number`

Entries per claim; default 100.

***

### leaseMs?

> `optional` **leaseMs?**: `number`

Claim lease; a crashed publish is retried after it expires; default 60000.

***

### logger?

> `optional` **logger?**: `Logger`

Logger override; default `getLogger('@blue/jobs')`.

***

### pollIntervalMs?

> `optional` **pollIntervalMs?**: `number`

Delay between empty polls; default 1000.

***

### publisher

> **publisher**: [`OutboxPublisher`](OutboxPublisher.md)

The publisher each claim is handed to.

***

### retainPublishedMs?

> `optional` **retainPublishedMs?**: `number`

When set, published entries older than this are pruned each pass.

***

### store

> **store**: [`OutboxStore`](OutboxStore.md)

The store entries are claimed from.
