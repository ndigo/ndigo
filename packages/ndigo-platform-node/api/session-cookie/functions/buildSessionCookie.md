[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [session-cookie](../README.md) / buildSessionCookie

# Function: buildSessionCookie()

> **buildSessionCookie**(`token`, `options?`): `string`

Builds the `Set-Cookie` value for a session token:
`__Host-ndigo-session=<token>; HttpOnly; SameSite=Lax; Path=/[; Secure]`.
The name is configurable via `options.name`.

## Parameters

### token

`string`

The session token.

### options?

[`SessionCookieOptions`](../interfaces/SessionCookieOptions.md) = `{}`

Cookie name/security options.

## Returns

`string`

The `Set-Cookie` value.

## Throws

When a `__Host-`-prefixed `name` is combined
with `secure: false` (the browser would reject the cookie).
