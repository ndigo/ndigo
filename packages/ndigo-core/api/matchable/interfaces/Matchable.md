[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [matchable](../README.md) / Matchable

# Interface: Matchable\<TValue\>

Represents an object that can determine if it matches a given value.

## Extended by

- [`PathMatcherFilter`](../../path-matcher/interfaces/PathMatcherFilter.md)

## Type Parameters

### TValue

`TValue`

## Methods

### matches()

> **matches**(`value`): `boolean`

Determines if this object matches the specified value.

#### Parameters

##### value

`TValue`

The value to match against.

#### Returns

`boolean`

`true` if the object matches the value, `false` otherwise.
