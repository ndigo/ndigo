[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / RangeIterator

# Class: RangeIterator

Defined in: packages/blue-core/src/iterable.ts:204

## Implements


The start or end of the range


The end of the range


The amount by which values are incremented

## Implements

- `IterableIterator`\<`number`\>

## Constructors

### Constructor

> **new RangeIterator**(`startOrEnd`, `end?`, `step?`): `RangeIterator`

Defined in: packages/blue-core/src/iterable.ts:213

#### Parameters

##### startOrEnd

`number`

##### end?

`number`

##### step?

`number`

#### Returns

`RangeIterator`

## Methods

### \[iterator\]()

> **\[iterator\]**(): `IterableIterator`\<`number`\>

Defined in: packages/blue-core/src/iterable.ts:209

#### Returns

`IterableIterator`\<`number`\>

#### Implementation of

`IterableIterator.[iterator]`

***

### next()

> **next**(): `IteratorResult`\<`number`\>

Defined in: packages/blue-core/src/iterable.ts:231

#### Returns

`IteratorResult`\<`number`\>

#### Implementation of

`IterableIterator.next`
