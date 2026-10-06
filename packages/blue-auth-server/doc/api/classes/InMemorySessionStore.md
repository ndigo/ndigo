[**@blue/auth-server v0.0.1**](../README.md)

***

[@blue/auth-server](../README.md) / InMemorySessionStore

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

#### Parameters

##### options?

[`InMemorySessionStoreOptions`](../interfaces/InMemorySessionStoreOptions.md) = `{}`

#### Returns

`InMemorySessionStore`

## Properties

### kind

> `readonly` **kind**: `"in-memory"` = `'in-memory'`

Backend identifier for observability/diagnostics
(e.g. `'in-memory'`, `'redis'`).

#### Implementation of

`SessionStore.kind`

## Methods

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

### deleteForUser()

> **deleteForUser**(`userId`): `Promise`\<`number`\>

Terminates every **live** session belonging to `userId` and returns
how many were removed (expired-but-unswept entries are purged without
being counted as live). This is the user-wide revocation primitive:
the two shipped stores implement it as an indexed sweep (`DELETE …
WHERE principal_id = ?`); callers that also want outstanding JWTs of
the account revoked should bump the account's `tokenVersion` — see
`CredentialsAuthAdapter.logoutAll`.

Idempotent: an account with no live sessions returns `0`.

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`number`\>

#### Implementation of

`SessionStore.deleteForUser`

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
