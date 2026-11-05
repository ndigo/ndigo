[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [comparable](../README.md) / Comparable

# Interface: Comparable\<T\>

Interface for objects that can be compared to another object of the same type.

## Extended by

- [`StringComparable`](StringComparable.md)

## Type Parameters

### T

`T`

The type of the object being compared.

## Methods

### compareTo()

> **compareTo**(`value`): `number`

Compares this object with the specified object for order. Returns a negative integer, zero, or a positive integer
as this object is less than, equal to, or greater than the specified object.

#### Parameters

##### value

`T`

The object to be compared.

#### Returns

`number`

A negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object.
