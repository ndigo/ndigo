[**@ndigo/util v0.0.1**](../../README.md)

***

[@ndigo/util](../../README.md) / [ndigo-util](../README-2.md) / isNil

# Function: isNil()

> **isNil**(`x`): x is null \| undefined

Checks if the input value is `null` or `undefined`.

## Parameters

### x

`unknown`

The value to test.

## Returns

x is null \| undefined

`true` if `x` is `undefined` or `null`, otherwise `false`.

## Example

```ts
isNil( null ); //=> true
isNil( undefined ); //=> true
isNil( 0 ); //=> false
isNil( [] ); //=> false
```
