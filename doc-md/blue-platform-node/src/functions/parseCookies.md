[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / parseCookies

# Function: parseCookies()

> **parseCookies**(`header`, `options?`): `Record`\<`string`, `string`\>

Defined in: [packages/blue-platform-node/src/cookie-parser.ts:32](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/cookie-parser.ts#lines-32)

Parses a raw `Cookie` header value into a name→value record.
Duplicated names keep the **first** occurrence (RFC 6265 §5.3 ordering);
malformed entries (no `=`, empty name) are skipped.

## Parameters

### header

`string` \| `undefined`

### options?

[`CookieParseOptions`](../interfaces/CookieParseOptions.md) = `{}`

## Returns

`Record`\<`string`, `string`\>

## Throws

when the entry or value limits are exceeded.
