[**@blue/orm-drizzle v0.0.1**](../README.md)

***

[@blue/orm-drizzle](../README.md) / LibSQLJobStoreOptions

# Interface: LibSQLJobStoreOptions

Options for [LibSQLJobStore](../classes/LibSQLJobStore.md).

## Properties

### authToken?

> `optional` **authToken?**: `string`

Authentication token for remote libsql servers.

***

### client?

> `optional` **client?**: `Client`

A borrowed libsql client (reuse an existing connection — including an
application's transactional data-source client). Disposal leaves it
open unless `ownsClient` explicitly transfers ownership.

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

LibSQL URL (`'file:jobs.db'`, `':memory:'`, remote `libsql://` URL).
