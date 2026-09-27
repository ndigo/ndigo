[**@blue/auth-server v0.0.1**](../README.md)

***

[@blue/auth-server](../README.md) / JWTAdapter

# Class: JWTAdapter

A reference implementation of [AuthAdapter](#) for JWT-based authentication.

Uses `jose` for cryptographic signature verification:
- HMAC algorithms (HS256/HS384/HS512) via the shared `secret`
- Asymmetric algorithms (RS256/ES256/…) via a PEM `publicKey` or a JWKS
  endpoint (`jwksUrl`, auto-rotating + cached)

Issuer, audience, and expiration are validated on every token.

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

The unique identifier for this adapter (e.g., 'oidc', 'saml').

#### Implementation of

`AuthAdapter.id`

## Methods

### authenticate()

> **authenticate**(`_credentials`): `Promise`\<[`AuthResult`](#)\>

Performs the primary authentication flow.

#### Parameters

##### \_credentials

`unknown`

#### Returns

`Promise`\<[`AuthResult`](#)\>

An [AuthResult](#) containing the principal and session token.

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

#### Returns

`Promise`\<\{ `accessToken`: `string`; `expiresAt`: `number`; `refreshToken`: `string`; \}\>

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

#### Returns

`Promise`\<`void`\>

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

#### Returns

`Promise`\<[`JWTRefreshResult`](../interfaces/JWTRefreshResult.md)\>

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
HMAC and asymmetric algorithms (RS256/ES256…), and enforces issuer,
audience, and expiration claims. Trailing whitespace and other spec
allowances are handled by `jose`.

#### Implementation of

`AuthAdapter.validate`
