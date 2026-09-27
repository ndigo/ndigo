[**@blue/core v0.0.1**](../README.md)

***

[@blue/core](../README.md) / parseUrlGlob

# Function: parseUrlGlob()

> **parseUrlGlob**(`pattern`): `string` \| `null`

Parses a URL/route glob pattern into an anchored regular-expression source string.

Returns `null` if the pattern cannot be parsed.
The returned string is suitable for `new RegExp(result)`.

## Parameters

### pattern

`string`

The URL glob pattern to parse (e.g. `/api/*`, `**`, `[:alnum:]*`).

## Returns

`string` \| `null`

An anchored regex source string, or `null` if the pattern is invalid.
