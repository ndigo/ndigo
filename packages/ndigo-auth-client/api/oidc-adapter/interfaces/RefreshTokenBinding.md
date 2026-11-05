[**@ndigo/auth-client v0.0.1**](../../README.md)

***

[@ndigo/auth-client](../../README.md) / [oidc-adapter](../README.md) / RefreshTokenBinding

# Interface: RefreshTokenBinding

The subject binding recorded for a refresh token: which principal the
token was issued for. Set when the code exchange (or a rotation) captures
the token; consulted on every refresh so the new ID token cannot switch
subjects mid-session.

## Properties

### subject

> **subject**: `string`

The verified `sub` of the ID token the refresh token was issued with.
