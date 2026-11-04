[**@ndigo/auth-server v0.0.1**](../README.md)

***

[@ndigo/auth-server](../README.md) / JWTAdapterConfig

# Interface: JWTAdapterConfig

Configuration for the JWT adapter.

## Properties

### accessTokenTtlMs?

> `optional` **accessTokenTtlMs?**: `number`

Lifetime of issued access tokens (default 15 minutes).

***

### algorithm

> **algorithm**: `string`

The algorithm used for signing (e.g., 'HS256', 'RS256').

***

### audience

> **audience**: `string`

The audience (aud) claim to validate.

***

### clockToleranceSeconds?

> `optional` **clockToleranceSeconds?**: `number`

Clock skew tolerance (seconds) applied to the `exp`/`nbf` claim checks
(default 0). Raise it when token issuers and this verifier disagree on
the current time.

***

### issuer

> **issuer**: `string`

The issuer (iss) claim to validate.

***

### jwksUrl?

> `optional` **jwksUrl?**: `string`

JWKS endpoint URL (e.g. an OIDC provider's `jwks_uri`). When set, keys are
fetched + cached from this endpoint and rotated automatically, taking
precedence over `publicKey`.

***

### publicKey?

> `optional` **publicKey?**: `string`

PEM-encoded public key (RS256/ES256/etc.). Required when `algorithm` is
an asymmetric alg and no `jwksUrl` is provided.

***

### refreshTokenTtlMs?

> `optional` **refreshTokenTtlMs?**: `number`

Lifetime of issued refresh tokens (default 7 days).

***

### revocationCacheTtlMs?

> `optional` **revocationCacheTtlMs?**: `number`

Short-TTL cache for `tokenVersion` reads during validation (ms).
`0` (default) reads the store on every validation — revocation is
visible immediately at the cost of one user-record read per request;
a positive value trades revocation latency for throughput.

***

### secret?

> `optional` **secret?**: `string`

HMAC shared secret (HS256/HS384/HS512). Required when `algorithm` is
an HS* alg, and must be at least 32 bytes (256 bits) of UTF-8.

***

### userStore?

> `optional` **userStore?**: `UserStore`

User store backing `ver`-claim revocation (AD-33 D-7). When present:
`validate` checks the `ver` claim of framework-issued tokens against
the account's `tokenVersion`, `issueTokens` snapshots the current
version, and `refresh`/`logout` advance it (rotating the family and
invalidating every older token). Tokens WITHOUT a `ver` claim (e.g.
external IdP tokens) skip the check — revocation never rejects
tokens this adapter did not version.
