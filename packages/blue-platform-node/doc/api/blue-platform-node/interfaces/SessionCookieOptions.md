[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / SessionCookieOptions

# Interface: SessionCookieOptions

Options for the session cookie.

## Properties

### name?

> `optional` **name?**: `string`

Cookie name escape hatch for deployments (migrations, dev over plain
HTTP). Defaults to [SESSION\_COOKIE](../variables/SESSION_COOKIE.md). A `__Host-`-prefixed name
with `secure: false` is invalid by construction and fails loudly —
choose an unprefixed name (and set it consistently when reading).

***

### secure?

> `optional` **secure?**: `boolean`

Add the `Secure` attribute. Default `true` — same posture as the
CSRF cookie: over plain HTTP the cookie would be transmitted in
clear. Set `false` for localhost dev only.
