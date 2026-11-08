[**@ndigo/orm-drizzle v0.0.1**](../../README.md)

***

[@ndigo/orm-drizzle](../../README.md) / [libsql-session-store](../README.md) / LibSQLSessionStore

# Class: LibSQLSessionStore

Sessions share the application-owned `ndigo_sessions` table. Rotation is a
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
- `Closeable`

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

Store identifier (`'libsql'`).

#### Implementation of

`SessionStore.kind`

## Methods

### close()

> **close**(): `void`

Supported Closeable bridge used by application-context shutdown.

#### Returns

`void`

#### Implementation of

`Closeable.close`

***

### create()

> **create**(`record`, `ttlMs`): `Promise`\<`string`\>

Creates a session record.

#### Parameters

##### record

`SessionRecord`

The session record to store.

##### ttlMs

`number`

The session lifetime in milliseconds.

#### Returns

`Promise`\<`string`\>

The generated session id.

#### Implementation of

`SessionStore.create`

***

### delete()

> **delete**(`sessionId`): `Promise`\<`void`\>

Deletes one session.

#### Parameters

##### sessionId

`string`

The session id.

#### Returns

`Promise`\<`void`\>

A promise that resolves once deleted.

#### Implementation of

`SessionStore.delete`

***

### deleteForUser()

> **deleteForUser**(`userId`): `Promise`\<`number`\>

Deletes every live session belonging to a user.

#### Parameters

##### userId

`string`

The account id.

#### Returns

`Promise`\<`number`\>

The number of live sessions removed.

#### Implementation of

`SessionStore.deleteForUser`

***

### dispose()

> **dispose**(): `void`

Idempotent: only owned clients close; all later store operations reject.

#### Returns

`void`

***

### get()

> **get**(`sessionId`): `Promise`\<`SessionRecord` \| `null`\>

Returns the live session record for an id.

#### Parameters

##### sessionId

`string`

The session id.

#### Returns

`Promise`\<`SessionRecord` \| `null`\>

The record, or `null` when missing or expired.

#### Implementation of

`SessionStore.get`

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Explicit, idempotent provisioning of this store's table/index only.

#### Returns

`Promise`\<`void`\>

A promise that resolves once provisioned.

***

### rotate()

> **rotate**(`sessionId`, `record`): `Promise`\<\{ `expiresAt`: `number`; `id`: `string`; \}\>

Rotates a session, preserving its absolute expiry.

#### Parameters

##### sessionId

`string`

The current session id.

##### record

`SessionRecord`

The record to store under the new id.

#### Returns

`Promise`\<\{ `expiresAt`: `number`; `id`: `string`; \}\>

The new session id and its effective expiry.

#### Implementation of

`SessionStore.rotate`
