[**@ndigo/auth-client v0.0.1**](../README.md)

***

[@ndigo/auth-client](../README.md) / AuthorizationRequest

# Interface: AuthorizationRequest

A pending authorization-code request created by [OIDCAdapter.createAuthorizationRequest](../classes/OIDCAdapter.md#createauthorizationrequest).

`state` is the callback correlation value; re-read it from the
authorization response. The nonce and PKCE verifier live in the adapter's
configured [OIDCAdapterConfig.pendingStore](OIDCAdapterConfig.md#pendingstore) — see that option for
surviving the redirect across adapter instances.

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
