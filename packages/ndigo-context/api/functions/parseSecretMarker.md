[**@ndigo/context v0.0.1**](../README.md)

***

[@ndigo/context](../README.md) / parseSecretMarker

# Function: parseSecretMarker()

> **parseSecretMarker**(`value`): [`SecretMarker`](../interfaces/SecretMarker.md) \| `null`

Parses a secret marker in `{scheme[:version]:payload}` form.

Returns `null` for any string that is not in marker form — such values
pass through the decrypt path untouched. A marker that IS in marker form
but has a malformed version segment (e.g. `{cipher:1:payload}`, where the
version must be letter-first like `v1`) throws a [FrameworkError](#)
instead of being silently folded into the payload. A marker with an
unknown scheme / version is the caller's business: decryption fails loud
there.

## Parameters

### value

`string`

The candidate marker string.

The marker shape is RESERVED: any plaintext value that happens to match
`{scheme[:version]:...}` (e.g. `{en: hello}`) is treated as a marker and
fails loud at lookup when the scheme is not registered — config values
that look like markers cannot coexist with a wired decryptor.

## Returns

[`SecretMarker`](../interfaces/SecretMarker.md) \| `null`

The parsed marker, or `null` when not in marker form.
