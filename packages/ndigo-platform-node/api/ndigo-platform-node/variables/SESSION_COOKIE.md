[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [ndigo-platform-node](../README.md) / SESSION\_COOKIE

# Variable: SESSION\_COOKIE

> `const` **SESSION\_COOKIE**: `"__Host-ndigo-session"` = `'__Host-ndigo-session'`

The session cookie name for opaque server sessions (AD-33 D-6).

Carries the `__Host-` security prefix (SEC-AUD2-SEC-2 / PLN-F6): browsers
accept such a cookie only when it is `Secure`, `Path=/` and `Domain`-less,
which pins it to the exact origin and defeats cookie tossing / planting from
a sibling subdomain or a non-`Secure` look-alike. Both constraints are
satisfied by [buildSessionCookie](../functions/buildSessionCookie.md); a name that must trade them away
(e.g. the localhost demo over plain HTTP) can opt out through
[SessionCookieOptions.name](../interfaces/SessionCookieOptions.md#name).
