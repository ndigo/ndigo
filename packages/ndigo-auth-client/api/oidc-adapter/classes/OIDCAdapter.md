[**@ndigo/auth-client v0.0.1**](../../README.md)

***

[@ndigo/auth-client](../../README.md) / [oidc-adapter](../README.md) / OIDCAdapter

# Class: OIDCAdapter

A standardized adapter for authentication providers.

Implementations of this interface handle the protocol-specific logic
(e.g., OAuth2, OIDC, SAML) to verify identities and manage sessions.

## Implements

- [`AuthAdapter`](../../index/interfaces/AuthAdapter.md)

## Constructors

### Constructor

> **new OIDCAdapter**(`config`): `OIDCAdapter`

#### Parameters

##### config

[`OIDCAdapterConfig`](../interfaces/OIDCAdapterConfig.md)

#### Returns

`OIDCAdapter`

## Properties

### id

> `readonly` **id**: `"oidc"` = `'oidc'`

The unique identifier for this adapter (e.g., 'oidc', 'saml').

#### Implementation of

[`AuthAdapter`](../../index/interfaces/AuthAdapter.md).[`id`](../../index/interfaces/AuthAdapter.md#id)

## Methods

### authenticate()

> **authenticate**(`_credentials`): `Promise`\<[`AuthResult`](../../index/interfaces/AuthResult.md)\>

Performs the primary authentication flow.

#### Parameters

##### \_credentials

`unknown`

#### Returns

`Promise`\<[`AuthResult`](../../index/interfaces/AuthResult.md)\>

An [AuthResult](../../index/interfaces/AuthResult.md) containing the principal and session token.

#### Implementation of

[`AuthAdapter`](../../index/interfaces/AuthAdapter.md).[`authenticate`](../../index/interfaces/AuthAdapter.md#authenticate)

***

### createAuthorizationRequest()

> **createAuthorizationRequest**(): `Promise`\<[`AuthorizationRequest`](../interfaces/AuthorizationRequest.md)\>

Creates an authorization request: generates `state`, PKCE S256
parameters, and `nonce`, stores the pending request in the configured
[PendingAuthorizationStore](../interfaces/PendingAuthorizationStore.md), and returns the
authorization-endpoint URL to redirect the user to.

#### Returns

`Promise`\<[`AuthorizationRequest`](../interfaces/AuthorizationRequest.md)\>

***

### exchangeCodeForTokens()

> **exchangeCodeForTokens**(`code`, `state`): `Promise`\<[`OIDCResult`](../interfaces/OIDCResult.md)\>

Consumes the pending authorization request matching `state` from the
configured [PendingAuthorizationStore](../interfaces/PendingAuthorizationStore.md) and exchanges the
authorization code for tokens at the token endpoint.

Fails closed: unknown/expired `state`, malformed responses, and any
ID-token verification failure throw without mutating auth state. A
`refresh_token` in the response is captured and bound to the verified
subject for later [refresh](#refresh) calls. With
the default in-memory store the callback must be handled by the same
adapter instance that created the request; inject a shared store to
survive redirects, restarts, or multiple instances.

#### Parameters

##### code

`string`

##### state

`string`

#### Returns

`Promise`\<[`OIDCResult`](../interfaces/OIDCResult.md)\>

***

### getEndSessionUrl()

> **getEndSessionUrl**(`idTokenHint?`, `postLogoutRedirectUri?`): `Promise`\<`string` \| `null`\>

Builds the provider's end-session URL from discovery metadata.
Returns `null` when discovery is disabled or no end-session endpoint
is advertised.

#### Parameters

##### idTokenHint?

`string`

##### postLogoutRedirectUri?

`string`

#### Returns

`Promise`\<`string` \| `null`\>

***

### logout()

> **logout**(`_token`): `Promise`\<`void`\>

Terminates the session associated with the given token.

#### Parameters

##### \_token

`string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`AuthAdapter`](../../index/interfaces/AuthAdapter.md).[`logout`](../../index/interfaces/AuthAdapter.md#logout)

***

### refresh()

> **refresh**(`token`): `Promise`\<[`OIDCResult`](../interfaces/OIDCResult.md)\>

Exchanges a refresh token for a new token set (`grant_type=refresh_token`)
at the token endpoint — discovery-resolved when enabled, with client-secret
authentication for confidential clients.

Only refresh tokens this adapter **captured** from a code exchange (or a
previous rotation, per the configured [RefreshTokenStore](../interfaces/RefreshTokenStore.md)) are
accepted: presenting an access or ID token fails with `invalid_token`
before any network call (the SE-7 mirror — as refresh tokens never
authenticate, access tokens never refresh).

The response's ID token passes the full verification path (signature,
issuer, audience, expiration) with **no nonce** — the nonce binds the
authorization flow only — and its subject must match the binding
recorded for the presented token.

Rotation: when the provider returns a new refresh token the presented
one is consumed (single-use); when it does not, the presented token
remains redeemable. Provider rejections (`400 invalid_grant` — expired,
revoked, or already-rotated tokens) surface as `invalid_token`, not as
transport errors.

#### Parameters

##### token

`string`

The refresh token captured from the exchange.

#### Returns

`Promise`\<[`OIDCResult`](../interfaces/OIDCResult.md)\>

#### Implementation of

[`AuthAdapter`](../../index/interfaces/AuthAdapter.md).[`refresh`](../../index/interfaces/AuthAdapter.md#refresh)

***

### validate()

> **validate**(`token`): `Promise`\<[`Principal`](../../index/interfaces/Principal.md) \| `null`\>

Validates an OIDC ID token and extracts the principal.

Verification is mandatory: signature (JWKS or configured validator),
issuer, audience, and expiration must all pass. Returns `null` on any
failure.

#### Parameters

##### token

`string`

The ID token to validate.

#### Returns

`Promise`\<[`Principal`](../../index/interfaces/Principal.md) \| `null`\>

#### Implementation of

[`AuthAdapter`](../../index/interfaces/AuthAdapter.md).[`validate`](../../index/interfaces/AuthAdapter.md#validate)
