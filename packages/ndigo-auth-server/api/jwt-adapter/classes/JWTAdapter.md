[**@ndigo/auth-server v0.0.1**](../../README.md)

***

[@ndigo/auth-server](../../README.md) / [jwt-adapter](../README.md) / JWTAdapter

# Class: JWTAdapter

A reference implementation of [AuthAdapter](#) for JWT-based authentication.

Uses `jose` for cryptographic signature verification:
- HMAC algorithms (HS256/HS384/HS512) via the shared `secret`
- Asymmetric algorithms (RS256/ES256/…) via a PEM `publicKey` or a JWKS
  endpoint (`jwksUrl`, auto-rotating + cached)

Issuer, audience, `exp`, and `sub` are required and validated on every token.

With a `userStore` wired (AD-33 D-7), the adapter also owns issuance and
revocation: `issueTokens` mints access + refresh JWTs snapshotting the
account's `tokenVersion` (`ver` claim); `refresh` advances the version —
every older access AND refresh token dies, so reuse of a rotated-out
refresh is rejected by construction (no ledger needed — the family
moves forward); `logout` advances the version outright.

## Implements

- [`AuthAdapter`](#)

## Constructors

### Constructor

> **new JWTAdapter**(`config`): `JWTAdapter`

#### Parameters

##### config

[`JWTAdapterConfig`](../interfaces/JWTAdapterConfig.md)

#### Returns

`JWTAdapter`

## Properties

### id

> `readonly` **id**: `"jwt"` = `'jwt'`

Adapter identifier (`'jwt'`).

#### Implementation of

`AuthAdapter.id`

## Methods

### authenticate()

> **authenticate**(`_credentials`): `Promise`\<[`AuthResult`](#)\>

Rejects direct credential authentication; JWT issuance is separate.

#### Parameters

##### \_credentials

`unknown`

Ignored; direct credentials are unsupported.

#### Returns

`Promise`\<[`AuthResult`](#)\>

Never — this method always throws.

#### Throws

Always, directing callers to an identity provider or auth flow.

#### Implementation of

`AuthAdapter.authenticate`

***

### issueTokens()

> **issueTokens**(`subject`): `Promise`\<\{ `accessToken`: `string`; `expiresAt`: `number`; `refreshToken`: `string`; \}\>

Mints an access + refresh token pair (AD-33 D-7).

HMAC (HS*) configurations only: asymmetric configs hold a public
key for validation, not a signing key — external IdPs own issuance
there. With a user store wired, the account must exist, be enabled,
and the `ver` claim snapshots the store's CURRENT `tokenVersion`
(never a caller-supplied value).

#### Parameters

##### subject

[`TokenSubject`](../interfaces/TokenSubject.md)

The account to issue tokens for.

#### Returns

`Promise`\<\{ `accessToken`: `string`; `expiresAt`: `number`; `refreshToken`: `string`; \}\>

The access and refresh tokens with the access expiry.

***

### logout()

> **logout**(`token`): `Promise`\<`void`\>

Revokes every outstanding token for the token's account by
advancing `tokenVersion` (AD-33 D-7). The presented token (access
or refresh) must verify — an unverifiable token revokes nothing and
throws (fail closed).

#### Parameters

##### token

`string`

The access or refresh token to revoke.

#### Returns

`Promise`\<`void`\>

A promise that resolves once the account version advances.

#### Implementation of

`AuthAdapter.logout`

***

### refresh()

> **refresh**(`token`): `Promise`\<[`JWTRefreshResult`](../interfaces/JWTRefreshResult.md)\>

Rotates a refresh token (AD-33 D-7): issues a new access + refresh
pair AFTER advancing the account's `tokenVersion` — every older
token (access and refresh alike) is dead the moment a refresh lands,
so replaying a rotated-out refresh token is rejected by the version
comparison. No rotation ledger needed: the family moves forward.

#### Parameters

##### token

`string`

The refresh token to rotate.

#### Returns

`Promise`\<[`JWTRefreshResult`](../interfaces/JWTRefreshResult.md)\>

The principal and the new access/refresh pair.

#### Throws

`JWTTokenError` when the token is invalid or superseded.

#### Implementation of

`AuthAdapter.refresh`

***

### validate()

> **validate**(`token`): `Promise`\<[`Principal`](#) \| `null`\>

Validates a JWT token and returns the associated principal.

#### Parameters

##### token

`string`

The JWT to validate.

#### Returns

`Promise`\<[`Principal`](#) \| `null`\>

The authenticated [Principal](#), or `null` if validation fails.

#### Remarks

Verifies the signature cryptographically via `jose` for both
HMAC and asymmetric algorithms (RS256/ES256…), and requires the
issuer, audience, `exp`, and `sub` claims. Trailing whitespace and
other spec allowances are handled by `jose`.

With a `userStore` wired, framework-issued tokens (`ver` claim) are
additionally checked against the live account: a bumped
`tokenVersion` or a disabled/deleted account rejects the token
(SE-7). External IdP tokens without `ver` skip the store check.

Framework-issued **refresh** tokens (`token_use: 'refresh'`) are
never accepted here — only access tokens authenticate requests
(`token_use: 'access'`, or absent for external IdP tokens).

#### Implementation of

`AuthAdapter.validate`
