[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / StringComparable

# Interface: StringComparable\<T\>

Defined in: [packages/blue-core/src/comparable.ts:40](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/comparable.ts#lines-40)

Interface for string-based objects that can be compared to another object of the same type, with case-insensitive comparison.

## Extends

- [`Comparable`](Comparable.md)\<`T`\>

## Type Parameters

### T

`T`

The type of the string-based object being compared.

## Methods

### compareTo()

> **compareTo**(`value`): `number`

Defined in: [packages/blue-core/src/comparable.ts:33](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/comparable.ts#lines-33)

Compares this object with the specified object for order. Returns a negative integer, zero, or a positive integer
as this object is less than, equal to, or greater than the specified object.

#### Parameters

##### value

`T`

The object to be compared.

#### Returns

`number`

A negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object.

#### Inherited from

[`Comparable`](Comparable.md).[`compareTo`](Comparable.md#compareto)

***

### compareToIgnoreCase()

> **compareToIgnoreCase**(`value`): `number`

Defined in: [packages/blue-core/src/comparable.ts:47](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/comparable.ts#lines-47)

Compares this string-based object with the specified string-based object for order, ignoring case.
Returns a negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object.

#### Parameters

##### value

`T`

The object to be compared.

#### Returns

`number`

A negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object.
