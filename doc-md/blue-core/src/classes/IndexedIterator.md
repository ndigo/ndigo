[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / IndexedIterator

# Class: IndexedIterator\<T\>

Defined in: [packages/blue-core/src/iterable.ts:134](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/iterable.ts#lines-134)

An iterator for array-like objects, providing sequential access to elements by index.

## Type Parameters

### T

`T` = `any`

The type of elements in the indexed collection.

## Implements

- `IterableIterator`\<`T`\>

## Constructors

### Constructor

> **new IndexedIterator**\<`T`\>(`indexed`): `IndexedIterator`\<`T`\>

Defined in: [packages/blue-core/src/iterable.ts:150](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/iterable.ts#lines-150)

Creates an instance of IndexedIterator.

#### Parameters

##### indexed

`ArrayLike`\<`T` \| `undefined`\>

The array-like collection to iterate over.

#### Returns

`IndexedIterator`\<`T`\>

## Methods

### \[iterator\]()

> **\[iterator\]**(): `IterableIterator`\<`T`\>

Defined in: [packages/blue-core/src/iterable.ts:142](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/iterable.ts#lines-142)

Returns the iterator itself, making this class compliant with the iterable protocol.

#### Returns

`IterableIterator`\<`T`\>

The current `IndexedIterator` instance.

#### Implementation of

`IterableIterator.[iterator]`

***

### next()

> **next**(): `IteratorResult`\<`T`\>

Defined in: [packages/blue-core/src/iterable.ts:159](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/iterable.ts#lines-159)

Returns the next element in the iteration sequence.

#### Returns

`IteratorResult`\<`T`\>

An `IteratorResult` object containing the next value and a `done` flag.

#### Implementation of

`IterableIterator.next`
