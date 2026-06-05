[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / likeSerializable

# Function: likeSerializable()

> **likeSerializable**(`value`): `boolean`

Defined in: packages/blue-core/src/serializable.ts:98

Tests whether a value can be serialized using the `Serializable` contract.

## Parameters

### value

`any`

Value to test.

## Returns

`boolean`

`true` when the value is already JSON-compatible or exposes `toJSON()`/`toString()`.
