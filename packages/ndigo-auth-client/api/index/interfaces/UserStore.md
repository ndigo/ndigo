[**@ndigo/auth-client v0.0.1**](../../README.md)

***

[@ndigo/auth-client](../../README.md) / [index](../README.md) / UserStore

# Interface: UserStore

Lookup contract for first-party user accounts (Wave 1 of the auth
completion plan; consumed by the credentials adapter in Wave 2).

## Methods

### findById()

> **findById**(`id`): `Promise`\<[`UserRecord`](UserRecord.md) \| `null`\>

Returns the account for `id`, or `null` when unknown.

#### Parameters

##### id

`string`

The account id.

#### Returns

`Promise`\<[`UserRecord`](UserRecord.md) \| `null`\>

***

### findByUsername()

> **findByUsername**(`username`): `Promise`\<[`UserRecord`](UserRecord.md) \| `null`\>

Returns the account for `username`, or `null` when unknown.

#### Parameters

##### username

`string`

The account username.

#### Returns

`Promise`\<[`UserRecord`](UserRecord.md) \| `null`\>

***

### incrementTokenVersion()

> **incrementTokenVersion**(`id`): `Promise`\<`number`\>

Advances the account's `tokenVersion` by one and returns the new
value (AD-33 D-7). This is the revocation primitive: JWTs carry a
`ver` claim that must equal `tokenVersion`; every bump kills every
outstanding token for the account. Stores should implement this as
a single atomic write (UPDATE ... SET token_version = token_version + 1) — the read-modify-write must not race.
Throws when `id` is unknown (fail closed).

#### Parameters

##### id

`string`

The account id.

#### Returns

`Promise`\<`number`\>

The new token version.

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
(UPDATE ... SET token_version = token_version + 1 WHERE id = $1 AND token_version = $2) and the affected-rows count. Must be atomic under
concurrent callers.
Throws when `id` is unknown (fail closed).

#### Parameters

##### id

`string`

The account id.

##### expected

`number`

The token version the caller observed.

#### Returns

`Promise`\<`number` \| `null`\>

The new token version, or `null` when the expectation lost.
