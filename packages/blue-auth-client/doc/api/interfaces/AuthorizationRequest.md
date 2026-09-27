[**@blue/auth-client v0.0.1**](../README.md)

***

[@blue/auth-client](../README.md) / AuthorizationRequest

# Interface: AuthorizationRequest

A pending authorization-code request created by [OIDCAdapter.createAuthorizationRequest](../classes/OIDCAdapter.md#createauthorizationrequest).

Persist `state` (and re-read it on callback) so the adapter can bind the
authorization response to this request; `codeVerifier` and `nonce` are
consumed internally.

## Properties

### codeVerifier

> **codeVerifier**: `string`

The PKCE verifier; keep server-side or in session storage only.

***

### expiresAt

> **expiresAt**: `number`

Epoch ms after which this request is no longer redeemable.

***

### nonce

> **nonce**: `string`

The OIDC `nonce` bound into the resulting ID token.

***

### state

> **state**: `string`

The CSRF `state` value carried through the provider round-trip.

***

### url

> **url**: `string`

The full authorization-endpoint URL to redirect the user to.
