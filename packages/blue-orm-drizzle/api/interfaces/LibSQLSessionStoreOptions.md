[**@blue/orm-drizzle v0.0.1**](../README.md)

***

[@blue/orm-drizzle](../README.md) / LibSQLSessionStoreOptions

# Interface: LibSQLSessionStoreOptions

## Properties

### authToken?

> `optional` **authToken?**: `string`

***

### client?

> `optional` **client?**: `Client`

Injected clients are borrowed unless ownership is explicitly transferred.
Use the default `intMode: 'number'`; strict decoding rejects other modes.

***

### maxSessions?

> `optional` **maxSessions?**: `number`

Shared-table live-session cap (default 512); enforced on create via a
count-gated insert in one `batch()` — single-file SQLite serializes
writers, but two racing creates against a remote libsql server can
over-admit by one.

***

### ownsClient?

> `optional` **ownsClient?**: `boolean`

***

### url?

> `optional` **url?**: `string`

URL for an owned client; defaults to ':memory:'.
