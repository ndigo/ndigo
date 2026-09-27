[**@blue/auth-server v0.0.1**](../README.md)

***

[@blue/auth-server](../README.md) / InMemoryUserStore

# Class: InMemoryUserStore

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

### upsert()

> **upsert**(`record`): `this`

Adds or replaces a record (test/demo setup helper).

#### Parameters

##### record

`UserRecord`

#### Returns

`this`
