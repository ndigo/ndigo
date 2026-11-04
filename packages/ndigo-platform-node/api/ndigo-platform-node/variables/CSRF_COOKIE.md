[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [ndigo-platform-node](../README.md) / CSRF\_COOKIE

# Variable: CSRF\_COOKIE

> `const` **CSRF\_COOKIE**: `"__Host-ndigo-csrf"` = `'__Host-ndigo-csrf'`

The cookie name holding the CSRF token.

`__Host-`-prefixed (Secure + `Path=/` + no `Domain` are required by
browsers for the prefix; the defaults here provide them) so a sibling
subdomain cannot overwrite the cookie — see the module docs.
