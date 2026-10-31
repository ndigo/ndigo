[**@blue/core v0.0.1**](../README.md)

***

[@blue/core](../README.md) / SetEntry

# Type Alias: SetEntry\<Value\>

> **SetEntry**\<`Value`\> = `Value` *extends* `Set`\<infer ValueType\> ? \[`ValueType`, `ValueType`\] : `never`

Represents a single entry for a Set-like value, where the entry is `[value, value]`.

## Type Parameters

### Value

`Value`

The Set-like value type.
