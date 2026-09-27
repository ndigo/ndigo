[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / buildSessionCookie

# Function: buildSessionCookie()

> **buildSessionCookie**(`token`, `options?`): `string`

Builds the `Set-Cookie` value for a session token:
`blue-session=<token>; HttpOnly; SameSite=Lax; Path=/[; Secure]`.

## Parameters

### token

`string`

### options?

[`SessionCookieOptions`](../interfaces/SessionCookieOptions.md) = `{}`

## Returns

`string`
