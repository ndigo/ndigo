[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / AbstractValueComparator

# Abstract Class: AbstractValueComparator

Defined in: packages/blue-core/src/comparable.ts:56

## Implements

- [`Comparator`](../interfaces/Comparator.md)\<`string`\>

## Constructors

### Constructor

> **new AbstractValueComparator**(`value`): `AbstractValueComparator`

Defined in: packages/blue-core/src/comparable.ts:63

#### Parameters

##### value

`string`

#### Returns

`AbstractValueComparator`

## Properties

### value

> `readonly` **value**: `string`

Defined in: packages/blue-core/src/comparable.ts:57

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-core/src/comparable.ts:59

##### Returns

`string`

## Methods

### compare()

> `abstract` **compare**(`pattern1`, `pattern2`): `number`

Defined in: packages/blue-core/src/comparable.ts:72

#### Parameters

##### pattern1

`string`

##### pattern2

`string`

#### Returns

`number`

#### Implementation of

`Comparator.compare`
