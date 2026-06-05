[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / SetEntry

# Type Alias: SetEntry\<Value\>

> **SetEntry**\<`Value`\> = `Value` *extends* `Set`\<infer ValueType\> ? \[`ValueType`, `ValueType`\] : `never`

Defined in: packages/blue-core/src/iterable.ts:65

Represents a single entry for a Set-like value, where the entry is `[value, value]`.

## Type Parameters

### Value

`Value`

The Set-like value type.
