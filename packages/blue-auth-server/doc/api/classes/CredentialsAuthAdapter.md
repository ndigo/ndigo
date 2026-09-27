[**@blue/auth-server v0.0.1**](../README.md)

***

[@blue/auth-server](../README.md) / CredentialsAuthAdapter

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
- `validate` — `SessionStore.get`, or `null` (expired/unknown/revoked).
- `refresh` — session **rotation**: new id, old id dead (fixation-safe).
- `logout` — session delete.

The rehash-on-login migration hook (`needsRehash`) is consumed at the
application layer (the `UserStore` contract has no password write in
v1 — see the auth completion plan, Wave 5 hardening).

## Implements

- [`AuthAdapter`](#)

## Constructors

### Constructor

> **new CredentialsAuthAdapter**(`options`): `CredentialsAuthAdapter`

#### Parameters

##### options

[`CredentialsAuthAdapterOptions`](../interfaces/CredentialsAuthAdapterOptions.md)

#### Returns

`CredentialsAuthAdapter`

## Properties

### id

> `readonly` **id**: `"credentials"` = `'credentials'`

The unique identifier for this adapter (e.g., 'oidc', 'saml').

#### Implementation of

`AuthAdapter.id`

## Methods

### authenticate()

> **authenticate**(`credentials`): `Promise`\<[`AuthResult`](#)\>

Performs the primary authentication flow.

#### Parameters

##### credentials

`unknown`

The credentials provided by the user. Adapters
narrow this opaque value to their protocol-specific credential shape.

#### Returns

`Promise`\<[`AuthResult`](#)\>

An [AuthResult](#) containing the principal and session token.

#### Implementation of

`AuthAdapter.authenticate`

***

### logout()

> **logout**(`token`): `Promise`\<`void`\>

Terminates the session associated with the given token.

#### Parameters

##### token

`string`

The token to invalidate.

#### Returns

`Promise`\<`void`\>

#### Implementation of

`AuthAdapter.logout`

***

### refresh()

> **refresh**(`token`): `Promise`\<[`AuthResult`](#)\>

Refreshes an existing session token.

#### Parameters

##### token

`string`

The token to refresh.

#### Returns

`Promise`\<[`AuthResult`](#)\>

A new [AuthResult](#) with the updated token.

#### Implementation of

`AuthAdapter.refresh`

***

### validate()

> **validate**(`token`): `Promise`\<[`Principal`](#) \| `null`\>

Validates a session token and returns the associated principal.

#### Parameters

##### token

`string`

The session or access token to validate.

#### Returns

`Promise`\<[`Principal`](#) \| `null`\>

The authenticated [Principal](#), or `null` if the token is invalid or expired.

#### Implementation of

`AuthAdapter.validate`
