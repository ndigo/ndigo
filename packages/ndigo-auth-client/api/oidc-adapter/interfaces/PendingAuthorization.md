[**@ndigo/auth-client v0.0.1**](../../README.md)

***

[@ndigo/auth-client](../../README.md) / [oidc-adapter](../README.md) / PendingAuthorization

# Interface: PendingAuthorization

One pending authorization-code request: the values
[OIDCAdapter.createAuthorizationRequest](../classes/OIDCAdapter.md#createauthorizationrequest) generates and
[OIDCAdapter.exchangeCodeForTokens](../classes/OIDCAdapter.md#exchangecodefortokens) needs to redeem the code.

`nonce` and `codeVerifier` are secrets — treat them like credentials when
persisting; whoever holds them can bind a forged authorization response to
this request.

## Properties

### codeVerifier

> **codeVerifier**: `string`

The PKCE S256 code verifier sent with the token exchange.

***

### expiresAt

> **expiresAt**: `number`

Epoch ms after which the request is no longer redeemable.

***

### nonce

> **nonce**: `string`

The OIDC `nonce` the resulting ID token must carry.

***

### state

> **state**: `string`

The CSRF `state` value, used as the store key.
