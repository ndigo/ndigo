[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [content-type-header](../README.md) / contentTypeBase

# Function: contentTypeBase()

> **contentTypeBase**(`contentType`): `string` \| `null`

Extracts the bare media type from a `Content-Type` header value: the part
before the first `;`, trimmed and lower-cased. `null` when the header is
absent or blank — callers that need a string fall back to `''`.

## Parameters

### contentType

`string` \| `null` \| `undefined`

The raw `Content-Type` header value.

## Returns

`string` \| `null`

The lower-cased media type without parameters, or `null`.
