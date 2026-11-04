[**@ndigo/context v0.0.1**](../README.md)

***

[@ndigo/context](../README.md) / isSecretMarkerLike

# Function: isSecretMarkerLike()

> **isSecretMarkerLike**(`value`): `boolean`

Non-throwing shape test for a marker-like string.

Unlike [parseSecretMarker](parseSecretMarker.md), this NEVER throws: it answers only
"does this string look like a `{scheme:...}` marker?" — including malformed
markers whose version segment is invalid. It exists so the fail-open path
(no decryptor configured) can warn about a marker-shaped value without a
malformed marker turning an ordinary read into a failure (SEC-10 fail-open
contract, CTX-04).

## Parameters

### value

`unknown`

The candidate string.

## Returns

`boolean`

`true` when the value has the reserved `{scheme:...}` shape.
