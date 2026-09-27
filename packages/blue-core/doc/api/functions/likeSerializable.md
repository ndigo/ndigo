[**@blue/core v0.0.1**](../README.md)

***

[@blue/core](../README.md) / likeSerializable

# Function: likeSerializable()

> **likeSerializable**(`value`): `boolean`

Tests whether a value can be serialized using the `Serializable` contract.

## Parameters

### value

`unknown`

Value to test.

## Returns

`boolean`

`true` when the value is already JSON-compatible or exposes `toJSON()`/`toString()`.
