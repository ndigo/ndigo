[**@blue/orm-drizzle v0.0.1**](../README.md)

***

[@blue/orm-drizzle](../README.md) / LibSQLOutboxStoreOptions

# Interface: LibSQLOutboxStoreOptions

Options for [LibSQLOutboxStore](../classes/LibSQLOutboxStore.md).

## Properties

### authToken?

> `optional` **authToken?**: `string`

Authentication token for remote libsql servers.

***

### client?

> `optional` **client?**: `Client`

The application's libsql client — pass the `DrizzleDataSource.client`
to join `@transactional` boundaries. Borrowed by default.

***

### idFactory?

> `optional` **idFactory?**: () => `string`

Id factory override; defaults to `crypto.randomUUID`.

#### Returns

`string`

***

### ownsClient?

> `optional` **ownsClient?**: `boolean`

Transfer ownership of an injected client; defaults to false.

***

### url?

> `optional` **url?**: `string`

LibSQL URL (`'file:outbox.db'`, `':memory:'`, remote `libsql://` URL).
