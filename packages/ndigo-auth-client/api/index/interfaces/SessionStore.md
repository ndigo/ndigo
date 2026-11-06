[**@ndigo/auth-client v0.0.1**](../../README.md)

***

[@ndigo/auth-client](../../README.md) / [index](../README.md) / SessionStore

# Interface: SessionStore

Backing store contract for opaque server sessions (audit M4).

The `kind` identifier mirrors `QueueMessageStore` (socket package):
`'in-memory'` first, persistent backends (Redis/LibSQL) later — the
interface is the deliverable, in-memory is the reference implementation.
Implementations MUST enforce TTL expiry on read and MUST NOT resurrect
expired or deleted sessions. Implementations SHOULD bound concurrent
storage (an unbounded live-session map is a memory DoS) — the reference
implementation rejects creates at its capacity (SEC-4, 2026-09-27
review).

## Properties

### kind

> `readonly` **kind**: `string`

Backend identifier for observability/diagnostics
(e.g. `'in-memory'`, `'redis'`).

## Methods

### create()

> **create**(`record`, `ttlMs`): `Promise`\<`string`\>

Persists `record` for `ttlMs` and returns the new opaque session id.

#### Parameters

##### record

[`SessionRecord`](SessionRecord.md)

##### ttlMs

`number`

#### Returns

`Promise`\<`string`\>

***

### delete()

> **delete**(`sessionId`): `Promise`\<`void`\>

Terminates the session. Unknown ids are a no-op.

#### Parameters

##### sessionId

`string`

#### Returns

`Promise`\<`void`\>

***

### deleteForUser()

> **deleteForUser**(`userId`): `Promise`\<`number`\>

Terminates every **live** session belonging to `userId` and returns
how many were removed (expired-but-unswept entries are purged without
being counted as live). This is the user-wide revocation primitive:
the two shipped stores implement it as an indexed sweep (DELETE ... WHERE principal_id = ?); callers that also want outstanding JWTs of
the account revoked should bump the account's `tokenVersion` — see
`CredentialsAuthAdapter.logoutAll`.

Idempotent: an account with no live sessions returns `0`.

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`number`\>

***

### get()

> **get**(`sessionId`): `Promise`\<[`SessionRecord`](SessionRecord.md) \| `null`\>

Returns the session record, or `null` when unknown or expired
(expired sessions are also purged).

#### Parameters

##### sessionId

`string`

#### Returns

`Promise`\<[`SessionRecord`](SessionRecord.md) \| `null`\>

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

[`SessionRecord`](SessionRecord.md)

#### Returns

`Promise`\<\{ `expiresAt`: `number`; `id`: `string`; \}\>
