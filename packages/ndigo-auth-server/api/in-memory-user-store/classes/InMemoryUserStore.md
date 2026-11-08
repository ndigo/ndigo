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

Creates the store, optionally seeding it.

#### Parameters

##### records?

readonly `UserRecord`[] = `[]`

Initial user records.

#### Returns

`InMemoryUserStore`

## Methods

### findById()

> **findById**(`id`): `Promise`\<`UserRecord` \| `null`\>

Finds a user by id.

#### Parameters

##### id

`string`

The account id.

#### Returns

`Promise`\<`UserRecord` \| `null`\>

The user record, or `null`.

#### Implementation of

`UserStore.findById`

***

### findByUsername()

> **findByUsername**(`username`): `Promise`\<`UserRecord` \| `null`\>

Finds a user by username.

#### Parameters

##### username

`string`

The account username.

#### Returns

`Promise`\<`UserRecord` \| `null`\>

The user record, or `null`.

#### Implementation of

`UserStore.findByUsername`

***

### incrementTokenVersion()

> **incrementTokenVersion**(`id`): `Promise`\<`number`\>

Advances a user's token version.

#### Parameters

##### id

`string`

The account id.

#### Returns

`Promise`\<`number`\>

The new token version.

#### Throws

When the account is unknown.

#### Implementation of

`UserStore.incrementTokenVersion`

***

### incrementTokenVersionIfCurrent()

> **incrementTokenVersionIfCurrent**(`id`, `expected`): `Promise`\<`number` \| `null`\>

Advances a user's token version only when it still matches `expected`.

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

#### Throws

When the account is unknown.

#### Implementation of

`UserStore.incrementTokenVersionIfCurrent`

***

### upsert()

> **upsert**(`record`): `this`

Adds or replaces a record (test/demo setup helper).

#### Parameters

##### record

`UserRecord`

The user record to store.

#### Returns

`this`

This store.
