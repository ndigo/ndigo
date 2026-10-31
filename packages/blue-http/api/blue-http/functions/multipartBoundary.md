[**@blue/http v0.0.1**](../../README.md)

***

[@blue/http](../../README.md) / [blue-http](../README.md) / multipartBoundary

# Function: multipartBoundary()

> **multipartBoundary**(`contentType`): `string` \| `null`

Extracts the multipart boundary from a `Content-Type` value, or `null`.
The media type must be `multipart/form-data`; the `boundary` parameter
name is matched case-insensitively (RFC 2045 §5.1) and quoted values are
unquoted by the MediaType parser. A pre-check only — the parser (busboy)
remains the authority on boundary syntax and validity.

## Parameters

### contentType

`string` \| `null` \| `undefined`

The raw `Content-Type` header value.

## Returns

`string` \| `null`

The boundary value, or `null` when absent or no multipart type.
