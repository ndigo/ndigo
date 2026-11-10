[**@ndigo/boot v0.0.1**](../../README.md)

***

[@ndigo/boot](../../README.md) / [config-file-loader](../README.md) / parseJsonConfig

# Function: parseJsonConfig()

> **parseJsonConfig**(`content`, `path`): `JSONObject`

Parse a JSON config document and include the file path in any decode error.

## Parameters

### content

`string`

The JSON text.

### path

`string`

The file path for diagnostics.

## Returns

`JSONObject`

The parsed JSON object.

## Throws

`IllegalStateError` when the document is not valid JSON.
