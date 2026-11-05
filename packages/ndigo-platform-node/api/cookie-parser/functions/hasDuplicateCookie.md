[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [cookie-parser](../README.md) / hasDuplicateCookie

# Function: hasDuplicateCookie()

> **hasDuplicateCookie**(`header`, `name`): `boolean`

Reports whether a raw `Cookie` header presents `name` more than once.

`parseCookies` deliberately keeps the **first** occurrence (RFC 6265 §5.3
ordering), which is safe for ordinary cookies but lets an attacker shadow a
security cookie by planting a look-alike ahead of it (cookie tossing from a
sibling subdomain, or a non-`Secure` HTTP-planted twin). Security-conscious
readers MUST fail closed on duplicates — treat the request as carrying no
such cookie — rather than trust the first or last value; this helper exposes
that signal. Multiple header lines (a `string[]`) are counted as one header.

## Parameters

### header

`string` \| readonly `string`[] \| `undefined`

The raw `Cookie` header value(s), or `undefined`.

### name

`string`

The exact cookie name to count.

## Returns

`boolean`

`true` when `name` appears two or more times.
