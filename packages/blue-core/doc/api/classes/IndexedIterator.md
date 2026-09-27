[**@blue/core v0.0.1**](../README.md)

***

[@blue/core](../README.md) / IndexedIterator

# Class: IndexedIterator\<T\>

An iterator for array-like objects, providing sequential access to elements by index.

## Type Parameters

### T

`T` = `unknown`

The type of elements in the indexed collection.

## Implements

- `IterableIterator`\<`T`\>

## Constructors

### Constructor

> **new IndexedIterator**\<`T`\>(`indexed`): `IndexedIterator`\<`T`\>

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

Returns the iterator itself, making this class compliant with the iterable protocol.

#### Returns

`IterableIterator`\<`T`\>

The current `IndexedIterator` instance.

#### Implementation of

`IterableIterator.[iterator]`

***

### next()

> **next**(): `IteratorResult`\<`T`\>

Returns the next element in the iteration sequence.

#### Returns

`IteratorResult`\<`T`\>

An `IteratorResult` object containing the next value and a `done` flag.

#### Implementation of

`IterableIterator.next`
