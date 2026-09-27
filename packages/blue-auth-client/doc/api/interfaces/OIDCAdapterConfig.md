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

### redirectUri

> **redirectUri**: `string`

The redirect URI for the authorization callback.

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
