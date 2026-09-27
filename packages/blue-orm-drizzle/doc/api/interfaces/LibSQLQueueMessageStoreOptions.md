[**@blue/orm-drizzle v0.0.1**](../README.md)

***

[@blue/orm-drizzle](../README.md) / LibSQLQueueMessageStoreOptions

# Interface: LibSQLQueueMessageStoreOptions

Options for [LibSQLQueueMessageStore](../classes/LibSQLQueueMessageStore.md).

## Properties

### authToken?

> `optional` **authToken?**: `string`

Authentication token for remote libsql servers.

***

### client?

> `optional` **client?**: `Client`

A shared libsql client (reuse an existing connection).
[LibSQLQueueMessageStore.dispose](../classes/LibSQLQueueMessageStore.md#dispose) closes it, so only inject a
client whose lifetime this store may end.

***

### url?

> `optional` **url?**: `string`

LibSQL URL (`'file:queues.db'`, `':memory:'`, remote `libsql://` URL).
