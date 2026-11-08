[**@ndigo/auth-server v0.0.1**](../../README.md)

***

[@ndigo/auth-server](../../README.md) / [in-memory-session-store](../README.md) / InMemorySessionStore

# Class: InMemorySessionStore

Reference [SessionStore](#) implementation: an in-memory map with
TTL enforcement.

Security/behavior contract:
- expiry is checked on read (expired entries are purged on access);
- `rotate` deletes the old id before issuing a new one, so fixation
  attacks can never re-use a client-chosen id;
- rotate on an unknown id throws (fail closed);
- `delete` is idempotent.

The `kind` marker (`'in-memory'`) matches the `QueueMessageStore`
convention: persistent backends (Redis/LibSQL) implement the same
contract with their own identifier. Memory hygiene: expired entries are
swept opportunistically at the capacity (`maxSessions`, default 512);
a create that still finds the store full after the sweep throws — the
cap bounds the live-session map (SEC-4, 2026-09-27 review).

## Implements

- [`SessionStore`](#)

## Constructors

### Constructor

> **new InMemorySessionStore**(`options?`): `InMemorySessionStore`

Creates a store with the given capacity.

#### Parameters

##### options?

[`InMemorySessionStoreOptions`](../interfaces/InMemorySessionStoreOptions.md) = `{}`

Store options (maximum live sessions).

#### Returns

`InMemorySessionStore`

## Properties

### kind

> `readonly` **kind**: `"in-memory"` = `'in-memory'`

Store identifier (`'in-memory'`).

#### Implementation of

`SessionStore.kind`

## Methods

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

### rotate()

> **rotate**(`sessionId`, `record`): `Promise`\<\{ `expiresAt`: `number`; `id`: `string`; \}\>

Rotates a session, preserving its remaining TTL.

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
