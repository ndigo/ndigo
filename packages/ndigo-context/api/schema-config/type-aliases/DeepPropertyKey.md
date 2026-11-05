[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [schema-config](../README.md) / DeepPropertyKey

# Type Alias: DeepPropertyKey\<T, P\>

> **DeepPropertyKey**\<`T`, `P`\> = `T` *extends* [`PrimitiveValue`](PrimitiveValue.md) \| readonly `unknown`[] ? `P` : `` { [K in keyof T & string]: DeepPropertyKey<T[K], P extends "" ? K : `${P}.${K}`> } ``

Recursive mapped type materializing the leaf keypaths of a shape —
the engine behind [PropertyKeyMap](PropertyKeyMap.md). Leaves become their key path
(`'server.port'`); objects descend. Exposed so the keypath shape of a
configuration can be reasoned about in types.

## Type Parameters

### T

`T`

### P

`P` *extends* `string`
