[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / getMethodNotAllowed

# Function: getMethodNotAllowed()

> **getMethodNotAllowed**(`route`): `string` \| `null`

Reads the recorded `Allow` value for a method-mismatch, if any.

## Parameters

### route

[`Route`](#)

The resolved route.

## Returns

`string` \| `null`

The `Allow` header value, or `null` when no method-mismatch occurred.
