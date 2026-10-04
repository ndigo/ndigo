[**@blue/orm-drizzle v0.0.1**](../README.md)

***

[@blue/orm-drizzle](../README.md) / LibSQLSessionStore

# Class: LibSQLSessionStore

Sessions share the application-owned `blue_sessions` table. Rotation is a
single conditional UPDATE: exactly one contender replaces a live id, retaining its
absolute expiry. Expired/unknown ids never rotate. Backend/corruption errors
reject, never become authentication misses. Principal methods are restored
with DefaultPrincipal; only id, name and roles are persisted.

Expired rows are purged on access and on create. The live-table cap bounds
session growth, including across independent clients. Applications sharing a
table should configure the same cap and synchronize their clocks.

Stop/drain consumers before close/dispose; pending operations are not drained.
`close` is the container's supported shutdown bridge, not automatic migration.

## Implements

- [`SessionStore`](#)

## Constructors

### Constructor

> **new LibSQLSessionStore**(`options?`): `LibSQLSessionStore`

#### Parameters

##### options?

[`LibSQLSessionStoreOptions`](../interfaces/LibSQLSessionStoreOptions.md) = `{}`

#### Returns

`LibSQLSessionStore`

## Properties

### kind

> `readonly` **kind**: `"libsql"` = `'libsql'`

Backend identifier for observability/diagnostics
(e.g. `'in-memory'`, `'redis'`).

#### Implementation of

`SessionStore.kind`

## Methods

### close()

> **close**(): `void`

Supported Closeable bridge used by application-context shutdown.

#### Returns

`void`

***

### create()

> **create**(`record`, `ttlMs`): `Promise`\<`string`\>

Persists `record` for `ttlMs` and returns the new opaque session id.

#### Parameters

##### record

`SessionRecord`

##### ttlMs

`number`

#### Returns

`Promise`\<`string`\>

#### Implementation of

`SessionStore.create`

***

### delete()

> **delete**(`sessionId`): `Promise`\<`void`\>

Terminates the session. Unknown ids are a no-op.

#### Parameters

##### sessionId

`string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

`SessionStore.delete`

***

### dispose()

> **dispose**(): `void`

Idempotent: only owned clients close; all later store operations reject.

#### Returns

`void`

***

### get()

> **get**(`sessionId`): `Promise`\<`SessionRecord` \| `null`\>

Returns the session record, or `null` when unknown or expired
(expired sessions are also purged).

#### Parameters

##### sessionId

`string`

#### Returns

`Promise`\<`SessionRecord` \| `null`\>

#### Implementation of

`SessionStore.get`

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Explicit, idempotent provisioning of this store's table/index only.

#### Returns

`Promise`\<`void`\>

***

### rotate()

> **rotate**(`sessionId`, `record`): `Promise`\<\{ `expiresAt`: `number`; `id`: `string`; \}\>

Replaces `sessionId` with a new id carrying `record` (session
fixation protection: login rotates the id so an attacker-chosen id
can never be adopted). The old id must stop working immediately.
Throws when `sessionId` is unknown (fail closed).

Returns the new session's id together with its **effective absolute
expiry** (COR-13): the caller must report this exact timestamp rather
than derive one from `issuedAt` + TTL — TTL semantics are
implementation-documented (the reference `InMemorySessionStore`
preserves the **remaining** TTL, so a refresh near expiry yields a
short-lived session; a sliding-window store would reset to a full
window).

#### Parameters

##### sessionId

`string`

##### record

`SessionRecord`

#### Returns

`Promise`\<\{ `expiresAt`: `number`; `id`: `string`; \}\>

#### Implementation of

`SessionStore.rotate`
