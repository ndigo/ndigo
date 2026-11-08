[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [cookie-parser](../README.md) / parseCookies

# Function: parseCookies()

> **parseCookies**(`header`, `options?`): `Record`\<`string`, `string`\>

Parses a raw `Cookie` header value into a name→value record.
Duplicated names keep the **first** occurrence (RFC 6265 §5.3 ordering);
malformed entries (no `=`, empty name) are skipped.

## Parameters

### header

`string` \| `undefined`

The raw `Cookie` header.

### options?

[`CookieParseOptions`](../interfaces/CookieParseOptions.md) = `{}`

Parsing limits.

## Returns

`Record`\<`string`, `string`\>

The parsed cookie record.

## Throws

when the entry or value limits are exceeded.
