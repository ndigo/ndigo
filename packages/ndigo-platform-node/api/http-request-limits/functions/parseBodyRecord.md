[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [http-request-limits](../README.md) / parseBodyRecord

# Function: parseBodyRecord()

> **parseBodyRecord**(`contentType`, `raw`): `Record`\<`string`, `unknown`\>

Applies content-type-aware parsing to a raw body, mirroring the adapter's
request-body contract (JSON is strict; any other non-empty type falls back
to raw text under the wildcard `'*'` key — no silent reshaping).

## Parameters

### contentType

`string` \| `undefined`

The request's `Content-Type` header value.

### raw

`Buffer`

The raw body bytes.

## Returns

`Record`\<`string`, `unknown`\>

The body record bound on `NodeRequest.body`.
