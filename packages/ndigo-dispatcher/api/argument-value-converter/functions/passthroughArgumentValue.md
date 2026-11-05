[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [argument-value-converter](../README.md) / passthroughArgumentValue

# Function: passthroughArgumentValue()

> **passthroughArgumentValue**(`_convertType`, `value`): `unknown`

Passes a resolved value through unchanged.

Used by resolvers whose values are already final (e.g. uploaded file parts),
so the shared required/default-value handling still runs without any type
conversion.

## Parameters

### \_convertType

\{ `source`: `unknown`; `target`: `unknown`; \} \| `undefined`

### value

`unknown`

## Returns

`unknown`
