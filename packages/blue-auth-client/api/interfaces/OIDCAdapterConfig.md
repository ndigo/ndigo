[**@blue/auth-client v0.0.1**](../README.md)

***

[@blue/auth-client](../README.md) / OIDCAdapterConfig

# Interface: OIDCAdapterConfig

Configuration for the OIDC adapter.

The adapter is **fail-closed**: at least one trusted token-verification
source is required at construction — `jwksUrl`, `discovery`, or an explicit
`tokenValidator`. Constructing without one throws.

## Properties

### allowedAlgorithms?

> `optional` **allowedAlgorithms?**: `string`[]

Allowed JWS algorithms. Defaults to an asymmetric-only allowlist.

***

### audience?

> `optional` **audience?**: `string`

The audience claim to validate. Defaults to `clientId` when omitted.

***

### authorizationTtlMs?

> `optional` **authorizationTtlMs?**: `number`

Pending authorization-request lifetime in ms (default 10 minutes).

***

### clientId

> **clientId**: `string`

The client ID registered with the identity provider.

***

### clientSecret?

> `optional` **clientSecret?**: `string`

The client secret (for confidential clients).

***

### discovery?

> `optional` **discovery?**: `boolean`

Resolve the authorization, token, JWKS, and end-session endpoints from
the provider's discovery document at `{issuer}/.well-known/openid-configuration`.
The document's `issuer` must equal the configured `issuer` exactly.

***

### fetchTimeoutMs?

> `optional` **fetchTimeoutMs?**: `number`

Timeout for discovery/JWKS/token-endpoint fetches (default 10s).

***

### issuer

> **issuer**: `string`

The issuer identifier (e.g., 'https://auth.example.com').

***

### jwksUrl?

> `optional` **jwksUrl?**: `string`

The provider's JWKS endpoint (`jwks_uri` from the OIDC discovery
document, or the provider's advertised JWKS URL). Tokens are verified
against these public keys. Required unless `discovery` or
`tokenValidator` is set.

***

### maxResponseBytes?

> `optional` **maxResponseBytes?**: `number`

Maximum accepted size of discovery/JWKS responses (default 1 MiB).

***

### pendingStore?

> `optional` **pendingStore?**: [`PendingAuthorizationStore`](PendingAuthorizationStore.md)

Persistence seam for pending authorization requests (`state`, `nonce`,
PKCE verifier) between the redirect and the callback. Defaults to an
in-memory store scoped to this adapter instance: a callback handled by
another instance — a fresh page load, a restart, or another server
instance — fails with `invalid_state` unless a store over shared
storage is supplied (for example `sessionStorage` in a browser or
Redis server-side).

***

### prompt?

> `optional` **prompt?**: `string`

Optional `prompt` value for the authorization request (e.g. `'consent'`,
`'login'`). Several providers require `prompt=consent` before they will
grant `offline_access` — and therefore issue refresh tokens.

***

### redirectUri

> **redirectUri**: `string`

The redirect URI for the authorization callback.

***

### refreshStore?

> `optional` **refreshStore?**: [`RefreshTokenStore`](RefreshTokenStore.md)

Persistence seam for refresh-token bindings (which principal each
captured refresh token belongs to, single-use rotation included).
Defaults to an in-memory store scoped to this adapter instance: a
refresh arriving on another instance — a second tab, a restart, or
another server — fails with `invalid_token` unless a store over
shared storage is supplied.

***

### scopes?

> `optional` **scopes?**: `string`[]

The scopes to request (e.g., ['openid', 'profile', 'email']).

***

### tokenValidator?

> `optional` **tokenValidator?**: (`token`, `payload`) => `Promise`\<`boolean`\>

Explicit custom token validation callback. It is responsible for
signature verification; the adapter still enforces issuer, audience,
expiration, and (during the code flow) nonce independently.

#### Parameters

##### token

`string`

##### payload

`Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<`boolean`\>
