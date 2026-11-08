[**@ndigo/orm-drizzle v0.0.1**](../../README.md)

***

[@ndigo/orm-drizzle](../../README.md) / [libsql-session-store](../README.md) / LibSQLSessionStoreOptions

# Interface: LibSQLSessionStoreOptions

Options for `LibSQLSessionStore`: either a borrowed `client` (ownership
transfers only with `ownsClient`) or a `url`/`authToken` pair for a client the
store owns, plus the shared-table `maxSessions` cap.

## Properties

### authToken?

> `optional` **authToken?**: `string`

libSQL auth token for an owned client.

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

Whether an injected client's ownership is transferred to the store.

***

### url?

> `optional` **url?**: `string`

URL for an owned client; defaults to ':memory:'.
