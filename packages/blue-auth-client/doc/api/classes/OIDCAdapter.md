[**@blue/auth-client v0.0.1**](../README.md)

***

[@blue/auth-client](../README.md) / OIDCAdapter

# Class: OIDCAdapter

An [AuthAdapter](../interfaces/AuthAdapter.md) implementation for OpenID Connect (OIDC).

This adapter implements the OIDC authorization code flow with PKCE:
- Resolving endpoints from validated discovery metadata (optional)
- Redirecting to the identity provider with `state`, PKCE, and `nonce`
- Exchanging the authorization code for tokens
- Verifying ID-token signature, issuer, audience, expiration, and nonce
  before constructing a principal

## Remarks

Verification is mandatory: construct with `jwksUrl`, `discovery`,
or `tokenValidator`. There is no claim-only mode.

## Implements

- [`AuthAdapter`](../interfaces/AuthAdapter.md)

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

[`AuthAdapter`](../interfaces/AuthAdapter.md).[`id`](../interfaces/AuthAdapter.md#id)

## Methods

### authenticate()

> **authenticate**(`_credentials`): `Promise`\<[`AuthResult`](../interfaces/AuthResult.md)\>

Performs the primary authentication flow.

#### Parameters

##### \_credentials

`unknown`

#### Returns

`Promise`\<[`AuthResult`](../interfaces/AuthResult.md)\>

An [AuthResult](../interfaces/AuthResult.md) containing the principal and session token.

#### Implementation of

[`AuthAdapter`](../interfaces/AuthAdapter.md).[`authenticate`](../interfaces/AuthAdapter.md#authenticate)

***

### createAuthorizationRequest()

> **createAuthorizationRequest**(): `Promise`\<[`AuthorizationRequest`](../interfaces/AuthorizationRequest.md)\>

Creates an authorization request: generates `state`, PKCE S256
parameters, and `nonce`, stores the pending request, and returns the
authorization-endpoint URL to redirect the user to.

#### Returns

`Promise`\<[`AuthorizationRequest`](../interfaces/AuthorizationRequest.md)\>

***

### exchangeCodeForTokens()

> **exchangeCodeForTokens**(`code`, `state`): `Promise`\<[`AuthResult`](../interfaces/AuthResult.md)\>

Consumes the pending authorization request matching `state` and
exchanges the authorization code for tokens at the token endpoint.

Fails closed: unknown/expired `state`, malformed responses, and any
ID-token verification failure throw without mutating auth state.

#### Parameters

##### code

`string`

##### state

`string`

#### Returns

`Promise`\<[`AuthResult`](../interfaces/AuthResult.md)\>

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

[`AuthAdapter`](../interfaces/AuthAdapter.md).[`logout`](../interfaces/AuthAdapter.md#logout)

***

### refresh()

> **refresh**(`_token`): `Promise`\<[`AuthResult`](../interfaces/AuthResult.md)\>

Refreshes an existing session token.

#### Parameters

##### \_token

`string`

#### Returns

`Promise`\<[`AuthResult`](../interfaces/AuthResult.md)\>

A new [AuthResult](../interfaces/AuthResult.md) with the updated token.

#### Implementation of

[`AuthAdapter`](../interfaces/AuthAdapter.md).[`refresh`](../interfaces/AuthAdapter.md#refresh)

***

### validate()

> **validate**(`token`): `Promise`\<[`Principal`](../interfaces/Principal.md) \| `null`\>

Validates an OIDC ID token and extracts the principal.

Verification is mandatory: signature (JWKS or configured validator),
issuer, audience, and expiration must all pass. Returns `null` on any
failure.

#### Parameters

##### token

`string`

The ID token to validate.

#### Returns

`Promise`\<[`Principal`](../interfaces/Principal.md) \| `null`\>

#### Implementation of

[`AuthAdapter`](../interfaces/AuthAdapter.md).[`validate`](../interfaces/AuthAdapter.md#validate)
