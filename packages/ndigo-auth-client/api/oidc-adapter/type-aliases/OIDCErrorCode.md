[**@ndigo/auth-client v0.0.1**](../../README.md)

***

[@ndigo/auth-client](../../README.md) / [oidc-adapter](../README.md) / OIDCErrorCode

# Type Alias: OIDCErrorCode

> **OIDCErrorCode** = `"configuration"` \| `"discovery"` \| `"network"` \| `"malformed_response"` \| `"malformed_token"` \| `"invalid_token"` \| `"invalid_state"` \| `"invalid_nonce"`

Error codes for OIDC failures. The message is safe to expose; the cause
(when attached) carries internal detail.
