[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / AbstractValueComparator

# Abstract Class: AbstractValueComparator

Defined in: packages/blue-core/src/comparable.ts:73

Interface for objects that can compare two values of a specific type.

## Implements

- [`Comparator`](../interfaces/Comparator.md)\<`string`\>

## Constructors

### Constructor

> **new AbstractValueComparator**(`value`): `AbstractValueComparator`

Defined in: packages/blue-core/src/comparable.ts:90

Creates an instance of AbstractValueComparator.

#### Parameters

##### value

`string`

The string value to be used for comparison.

#### Returns

`AbstractValueComparator`

## Properties

### value

> `readonly` **value**: `string`

Defined in: packages/blue-core/src/comparable.ts:77

The string value being compared.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-core/src/comparable.ts:82

The string tag for this class.

##### Returns

`string`

## Methods

### compare()

> `abstract` **compare**(`pattern1`, `pattern2`): `number`

Defined in: packages/blue-core/src/comparable.ts:105

Compares two string patterns. This method must be implemented by subclasses.

#### Parameters

##### pattern1

`string`

The first string pattern.

##### pattern2

`string`

The second string pattern.

#### Returns

`number`

A negative integer, zero, or a positive integer as the first pattern is less than, equal to, or greater than the second.

#### Implementation of

`Comparator.compare`
