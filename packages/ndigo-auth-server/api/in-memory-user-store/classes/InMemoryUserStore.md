[**@ndigo/auth-server v0.0.1**](../../README.md)

***

[@ndigo/auth-server](../../README.md) / [in-memory-user-store](../README.md) / InMemoryUserStore

# Class: InMemoryUserStore

In-memory `UserStore`: users live in two maps (by username and by id) and
vanish with the process, which makes it the store for tests and
single-process demos. The constructor seeds it in bulk; `upsert` keeps both
indexes in step thereafter.

## Implements

- `UserStore`

## Constructors

### Constructor

> **new InMemoryUserStore**(`records?`): `InMemoryUserStore`

#### Parameters

##### records?

readonly `UserRecord`[] = `[]`

#### Returns

`InMemoryUserStore`

## Methods

### findById()

> **findById**(`id`): `Promise`\<`UserRecord` \| `null`\>

Returns the account for `id`, or `null` when unknown.

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`UserRecord` \| `null`\>

#### Implementation of

`UserStore.findById`

***

### findByUsername()

> **findByUsername**(`username`): `Promise`\<`UserRecord` \| `null`\>

Returns the account for `username`, or `null` when unknown.

#### Parameters

##### username

`string`

#### Returns

`Promise`\<`UserRecord` \| `null`\>

#### Implementation of

`UserStore.findByUsername`

***

### incrementTokenVersion()

> **incrementTokenVersion**(`id`): `Promise`\<`number`\>

Advances the account's `tokenVersion` by one and returns the new
value (AD-33 D-7). This is the revocation primitive: JWTs carry a
`ver` claim that must equal `tokenVersion`; every bump kills every
outstanding token for the account. Stores should implement this as
a single atomic write (`UPDATE … SET token_version = token_version
+ 1`) — the read-modify-write must not race.
Throws when `id` is unknown (fail closed).

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`number`\>

#### Implementation of

`UserStore.incrementTokenVersion`

***

### incrementTokenVersionIfCurrent()

> **incrementTokenVersionIfCurrent**(`id`, `expected`): `Promise`\<`number` \| `null`\>

Compare-and-swap advancement of `tokenVersion` (AD-33 D-7, SEC-6):
bumps the version to `expected + 1` only when the current version is
still `expected`, returning the new value; returns `null` when the
current version no longer matches (someone else advanced it). This is
the atomic guard against refresh-token replay races — a stolen token
must lose to the legitimate holder's rotation even when both present
the same `ver` claim concurrently. Backed by a conditional UPDATE
(`UPDATE … SET token_version = token_version + 1 WHERE id = $1 AND
token_version = $2`) and the affected-rows count. Must be atomic under
concurrent callers.
Throws when `id` is unknown (fail closed).

#### Parameters

##### id

`string`

##### expected

`number`

#### Returns

`Promise`\<`number` \| `null`\>

#### Implementation of

`UserStore.incrementTokenVersionIfCurrent`

***

### upsert()

> **upsert**(`record`): `this`

Adds or replaces a record (test/demo setup helper).

#### Parameters

##### record

`UserRecord`

#### Returns

`this`
