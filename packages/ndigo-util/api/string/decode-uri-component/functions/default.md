[**@ndigo/util v0.0.1**](../../../README.md)

***

[@ndigo/util](../../../README.md) / [string/decode-uri-component](../README.md) / default

# Function: default()

> **default**(`value`): `string`

Enhanced decodeURIComponent
- Decodes + to a space.
- Converts the BOM to a replacement character �.
- Does not throw with invalid encoded input.
- Decodes as much of the string as possible.

## Parameters

### value

`string`

The encoded string

## Returns

`string`

The decoded string
