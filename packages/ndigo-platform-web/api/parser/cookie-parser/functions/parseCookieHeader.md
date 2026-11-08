[**@ndigo/platform-web v0.0.1**](../../../README.md)

***

[@ndigo/platform-web](../../../README.md) / [parser/cookie-parser](../README.md) / parseCookieHeader

# Function: parseCookieHeader()

> **parseCookieHeader**(`input`): `Record`\<`string`, `string`\>

Parses a `Cookie` header string into a name→value record, percent-decoding
both keys and values.

## Parameters

### input

`string`

The raw `Cookie` header.

## Returns

`Record`\<`string`, `string`\>

The percent-decoded cookie record.
