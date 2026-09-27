[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / negotiateEncoding

# Function: negotiateEncoding()

> **negotiateEncoding**(`header`): [`StaticEncoding`](../type-aliases/StaticEncoding.md) \| `null`

Parses an `Accept-Encoding` header into the preferred supported encoding.

q-values respected; ties prefer `br` (smaller payloads). `*` accepts any
encoding but only wins when it beats every explicit codec's q (explicit
beats wildcard on ties). `identity`, and q=0 exclusions fall through
correctly. Returns `null` when no supported encoding is acceptable (serve
the original).

## Parameters

### header

`string` \| `undefined`

## Returns

[`StaticEncoding`](../type-aliases/StaticEncoding.md) \| `null`
