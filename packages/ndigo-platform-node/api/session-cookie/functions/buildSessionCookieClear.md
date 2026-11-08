[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [session-cookie](../README.md) / buildSessionCookieClear

# Function: buildSessionCookieClear()

> **buildSessionCookieClear**(`options?`): `string`

Builds the `Set-Cookie` value that expires the session cookie
immediately (`Max-Age=0` + epoch `Expires`) under the same name and
`Secure`/`Path` attributes it was set with (no `Domain`).

## Parameters

### options?

[`SessionCookieOptions`](../interfaces/SessionCookieOptions.md) = `{}`

Cookie name/security options.

## Returns

`string`

The expiring `Set-Cookie` value.

## Throws

When a `__Host-`-prefixed `name` is combined
with `secure: false` (the browser would reject the clear).
