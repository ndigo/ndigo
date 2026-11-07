[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [comparable](../README.md) / StringComparator

# Class: StringComparator

A comparator for `string` objects, with a method for case-insensitive comparison.

## Extends

- `NaturalComparator`\<`string`\>

## Constructors

### Constructor

> **new StringComparator**(): `StringComparator`

Creates an instance of NaturalComparator.

#### Returns

`StringComparator`

#### Inherited from

`NaturalComparator<string>.constructor`

## Properties

### compare

> **compare**: [`comparison`](../type-aliases/comparison.md)\<`string`\>

The comparison function used by this comparator.

#### Inherited from

`NaturalComparator.compare`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

The string tag for this class.

##### Returns

`string`

#### Inherited from

`NaturalComparator.[toStringTag]`

## Methods

### compareIgnoreCase()

> **compareIgnoreCase**(`value1`, `value2`): `number`

Compares two strings ignoring case.

#### Parameters

##### value1

`string`

The first string.

##### value2

`string`

The second string.

#### Returns

`number`

A negative integer, zero, or a positive integer as the first string is less than, equal to, or greater than the second (case-insensitive).
