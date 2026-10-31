[**@blue/util v0.0.1**](../../README.md)

***

[@blue/util](../../README.md) / [blue-util](../README-3.md) / isNotNil

# Function: isNotNil()

> **isNotNil**\<`T`\>(`x`): `x is T`

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
