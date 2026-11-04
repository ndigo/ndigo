[**@ndigo/context v0.0.1**](../README.md)

***

[@ndigo/context](../README.md) / toLookupKey

# Function: toLookupKey()

> **toLookupKey**(`key`): `string`

Rewrites a keypath into resolver-safe form: the keypath parser stops at a
hyphen (it is not an identifier character), so a hyphenated segment must be
expressed as a quoted bracket access (`server.host-name` →
`server["host-name"]`). Every other segment is passed through untouched, so
existing bracket syntax (`arr[1]`) is preserved (CTX-01).

## Parameters

### key

`string`

The dotted keypath.

## Returns

`string`

The equivalent keypath the environment can resolve.
