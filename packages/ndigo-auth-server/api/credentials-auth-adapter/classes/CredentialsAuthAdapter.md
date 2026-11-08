[**@ndigo/auth-server v0.0.1**](../../README.md)

***

[@ndigo/auth-server](../../README.md) / [credentials-auth-adapter](../README.md) / CredentialsAuthAdapter

# Class: CredentialsAuthAdapter

The first-party credential authentication adapter (AD-33 D-5):
username/password → opaque server session.

Implements the existing [AuthAdapter](#) seam unchanged, so it plugs
into `AuthRegistry`/`AuthServer.validateAny` and the fail-closed
explicit-scheme discipline without framework changes:

- `authenticate` — `UserStore.findByUsername` + `PasswordEncoder.verify`,
  with a **dummy-hash verify on unknown users** equalizing timing and
  preventing user enumeration; disabled accounts and accounts without a
  hash never authenticate; success issues an opaque session token —
  **the token is the id issued by the `SessionStore`** (single source of
  truth for session keys; `InMemorySessionStore` uses 32-byte
  `randomBytes` tokens).
- `validate` — `SessionStore.get` **plus a live account check** (`SE-7`),
  or `null` (expired/unknown/revoked session, or a disabled/deleted
  account): disabling an account revokes its outstanding opaque sessions
  at the next validation.
- `refresh` — session **rotation**: new id, old id dead (fixation-safe);
  a disabled or deleted account cannot rotate.
- `logout` — session delete (single device).
- `logoutAll` — user-wide revocation (AD-68): every live session of the
  account is deleted and its `tokenVersion` advances, which also kills
  every outstanding JWT the `JWTAdapter` issued for the account.

The rehash-on-login migration hook (`needsRehash`) is consumed at the
application layer (the `UserStore` contract has no password write in
v1 — see the auth completion plan, Wave 5 hardening).

## Implements

- [`AuthAdapter`](#)

## Constructors

### Constructor

> **new CredentialsAuthAdapter**(`options`): `CredentialsAuthAdapter`

Creates the adapter over the given stores.

#### Parameters

##### options

[`CredentialsAuthAdapterOptions`](../interfaces/CredentialsAuthAdapterOptions.md)

User store, password encoder, session store, and TTL.

#### Returns

`CredentialsAuthAdapter`

## Properties

### id

> `readonly` **id**: `"credentials"` = `'credentials'`

Adapter identifier (`'credentials'`).

#### Implementation of

`AuthAdapter.id`

## Methods

### authenticate()

> **authenticate**(`credentials`): `Promise`\<[`AuthResult`](#)\>

Authenticates a username/password pair and issues an opaque session.

#### Parameters

##### credentials

`unknown`

The `{ username, password }` credentials.

#### Returns

`Promise`\<[`AuthResult`](#)\>

The authenticated principal, session token, and expiry.

#### Throws

`InvalidCredentialsError` for every failure mode.

#### Implementation of

`AuthAdapter.authenticate`

***

### logout()

> **logout**(`token`): `Promise`\<`void`\>

Deletes one session.

#### Parameters

##### token

`string`

The session token to revoke.

#### Returns

`Promise`\<`void`\>

A promise that resolves once deleted.

#### Implementation of

`AuthAdapter.logout`

***

### logoutAll()

> **logoutAll**(`userId`): `Promise`\<\{ `sessions`: `number`; `tokenVersion`: `number`; \}\>

Revokes every live credential of the account (AD-68): deletes all of
its opaque sessions and advances its `tokenVersion`, which invalidates
every outstanding JWT issued for the account by `JWTAdapter`. Sessions
are removed first so a failing version bump can never leave tokens
dead while sessions stay alive.

#### Parameters

##### userId

`string`

The account's stable id (`principal.id`).

#### Returns

`Promise`\<\{ `sessions`: `number`; `tokenVersion`: `number`; \}\>

The number of live sessions removed and the new token version.

#### Throws

When the account is unknown (`UserStore.incrementTokenVersion`
  fails closed).

***

### refresh()

> **refresh**(`token`): `Promise`\<[`AuthResult`](#)\>

Rotates a session token (fixation-safe: the old token dies).

#### Parameters

##### token

`string`

The current session token.

#### Returns

`Promise`\<[`AuthResult`](#)\>

The principal and the rotated session token/expiry.

#### Throws

`InvalidCredentialsError` when the session or account is invalid.

#### Implementation of

`AuthAdapter.refresh`

***

### validate()

> **validate**(`token`): `Promise`\<[`Principal`](#) \| `null`\>

Validates an opaque session token and its live account state.

#### Parameters

##### token

`string`

The session token.

#### Returns

`Promise`\<[`Principal`](#) \| `null`\>

The authenticated principal, or `null` when invalid/revoked.

#### Implementation of

`AuthAdapter.validate`
