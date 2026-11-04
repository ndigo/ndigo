[**@ndigo/orm-drizzle v0.0.1**](../README.md)

***

[@ndigo/orm-drizzle](../README.md) / LibSQLQueueMessageStoreOptions

# Interface: LibSQLQueueMessageStoreOptions

Options for [LibSQLQueueMessageStore](../classes/LibSQLQueueMessageStore.md).

## Properties

### authToken?

> `optional` **authToken?**: `string`

Authentication token for remote libsql servers.

***

### client?

> `optional` **client?**: `Client`

A borrowed libsql client (reuse an existing connection). Disposal
leaves it open unless `ownsClient` explicitly transfers ownership.

***

### ownsClient?

> `optional` **ownsClient?**: `boolean`

Transfer ownership of an injected client; defaults to false.

***

### url?

> `optional` **url?**: `string`

LibSQL URL (`'file:queues.db'`, `':memory:'`, remote `libsql://` URL).
