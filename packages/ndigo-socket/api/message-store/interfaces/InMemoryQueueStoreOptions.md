[**@ndigo/socket v0.0.1**](../../README.md)

***

[@ndigo/socket](../../README.md) / [message-store](../README.md) / InMemoryQueueStoreOptions

# Interface: InMemoryQueueStoreOptions

Options for [InMemoryQueueMessageStore](../classes/InMemoryQueueMessageStore.md).

## Properties

### maxBytes?

> `optional` **maxBytes?**: `number`

Global retained-byte budget across all destinations (oldest messages
evicted first). Default `67108864` (64 MiB) — parity with the
broker's `maxBacklogBytes`. `0` disables.

***

### maxDestinations?

> `optional` **maxDestinations?**: `number`

Distinct destinations retained (the oldest destination is evicted
whole past the bound). Default `1000`. `0` disables.

***

### maxMessagesPerDestination?

> `optional` **maxMessagesPerDestination?**: `number`

Retained messages per destination (oldest dropped past the bound).
Default `1000` — parity with the broker's `queueBacklog`. `0`
disables the count bound.

***

### now?

> `optional` **now?**: () => `number`

**`Internal`**

Injectable clock for deterministic tests (the registry's `now` clock
precedent). Defaults to `Date.now`.

#### Returns

`number`
