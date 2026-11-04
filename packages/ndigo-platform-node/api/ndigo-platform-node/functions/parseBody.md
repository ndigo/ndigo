[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [ndigo-platform-node](../README.md) / parseBody

# Function: parseBody()

> **parseBody**(`contentType`, `raw`): [`BodyParseResult`](../type-aliases/BodyParseResult.md)

Parses a request body according to its declared `Content-Type`.
Supported: `application/json` (strict — malformed JSON is rejected),
`text/*`, `application/x-www-form-urlencoded` (into `Record`), and any
other type as raw text under the wildcard `'*'` key.

## Parameters

### contentType

`string` \| `undefined`

### raw

`Buffer`

## Returns

[`BodyParseResult`](../type-aliases/BodyParseResult.md)
