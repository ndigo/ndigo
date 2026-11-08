[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [session-cookie](../README.md) / setSessionCookie

# Function: setSessionCookie()

> **setSessionCookie**(`route`, `token`, `options?`): `void`

Sets the session cookie on the request's node response. No-op after
headers were sent or without a response.

## Parameters

### route

[`Route`](#)

The current route.

### token

`string`

The session token.

### options?

[`SessionCookieOptions`](../interfaces/SessionCookieOptions.md)

Cookie name/security options.

## Returns

`void`
