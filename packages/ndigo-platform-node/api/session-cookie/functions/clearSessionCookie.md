[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [session-cookie](../README.md) / clearSessionCookie

# Function: clearSessionCookie()

> **clearSessionCookie**(`route`, `options?`): `void`

Clears the session cookie on the request's node response. No-op after
headers were sent or without a response. Pass the same `name`/`secure`
options used to set the cookie so the clear targets it exactly.

## Parameters

### route

[`Route`](#)

The current route.

### options?

[`SessionCookieOptions`](../interfaces/SessionCookieOptions.md)

Cookie name/security options.

## Returns

`void`
