[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / SessionCookieOptions

# Interface: SessionCookieOptions

Options for the session cookie.

## Properties

### secure?

> `optional` **secure?**: `boolean`

Add the `Secure` attribute. Default `true` — same posture as the
CSRF cookie: over plain HTTP the cookie would be transmitted in
clear. Set `false` for localhost dev only.
