[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / parseBody

# Function: parseBody()

> **parseBody**(`contentType`, `raw`): [`BodyParseResult`](../type-aliases/BodyParseResult.md)

Defined in: [packages/blue-platform-node/src/http-request-limits.ts:87](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/http-request-limits.ts#lines-87)

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
