[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [constructable](../README.md) / likeConstructable

# Variable: likeConstructable

> `const` **likeConstructable**: (`value`) => `value is Constructable<{}>`

Type guard to check if a value is a `Constructable` (i.e., a class constructor).

## Parameters

### value

`unknown`

The value to check.

## Returns

`value is Constructable<{}>`

`true` if the value is `Constructable`, `false` otherwise.

## Remarks

This is not a perfect test as `prototype` is optional on some constructables.
