[**@blue/socket v0.0.1**](../README.md)

***

[@blue/socket](../README.md) / InMemoryQueueStoreStats

# Interface: InMemoryQueueStoreStats

A snapshot of [InMemoryQueueMessageStore](../classes/InMemoryQueueMessageStore.md) retention ([InMemoryQueueMessageStore.stats](../classes/InMemoryQueueMessageStore.md#stats)).

## Properties

### destinations

> `readonly` **destinations**: `number`

Distinct destinations currently retaining at least one message.

***

### retainedBytes

> `readonly` **retainedBytes**: `number`

Retained body octets across every destination.

***

### seqEntries

> `readonly` **seqEntries**: `number`

Per-destination sequence counters held. Bounded by `destinations`:
the counter of a dropped destination is dropped with it (SEC-1).
