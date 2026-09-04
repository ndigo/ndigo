[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [type](../README.md) / isNil

# Function: isNil()

> **isNil**(`x`): x is null \| undefined

Defined in: packages/blue-util/src/type/index.ts:71

Checks if the input value is `null` or `undefined`.

## Parameters

### x

`any`

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
