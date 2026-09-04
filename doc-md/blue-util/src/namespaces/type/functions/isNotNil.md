[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [type](../README.md) / isNotNil

# Function: isNotNil()

> **isNotNil**\<`T`\>(`x`): `x is T`

Defined in: packages/blue-util/src/type/index.ts:73

Checks if the input value is not `null` or `undefined`.

## Type Parameters

### T

`T`

## Parameters

### x

`T` \| `null` \| `undefined`

The value to test.

## Returns

`x is T`

`false` if `x` is `undefined` or `null`, otherwise `true`.

## Example

```ts
isNotNil( null ); //=> false
isNotNil( undefined ); //=> false
isNotNil( 0 ); //=> true
isNotNil( [] ); //=> true
```
