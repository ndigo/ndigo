[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / Comparable

# Interface: Comparable\<T\>

Defined in: packages/blue-core/src/comparable.ts:30

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

Defined in: packages/blue-core/src/comparable.ts:37

Compares this object with the specified object for order. Returns a negative integer, zero, or a positive integer
as this object is less than, equal to, or greater than the specified object.

#### Parameters

##### value

`T`

The object to be compared.

#### Returns

`number`

A negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object.
