[**@ndigo/socket v0.0.1**](../README.md)

***

[@ndigo/socket](../README.md) / QueueStoreRetention

# Interface: QueueStoreRetention

What a caller asks the store to retain.

## Properties

### maxMessages?

> `readonly` `optional` **maxMessages?**: `number`

Drop the oldest messages past this many per destination.

***

### ttlMs?

> `readonly` `optional` **ttlMs?**: `number`

Drop messages this old or older (the boundary is inclusive).
