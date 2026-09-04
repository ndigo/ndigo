[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / EntriesIterator

# Class: EntriesIterator\<T\>

Defined in: packages/blue-core/src/iterable.ts:184

An iterator for the key-value pairs (entries) of an object or collection.
It can adapt to objects with an `entries()` method, or fall back to `Object.entries()`.

## Implements

external:IterableIterator

## Type Parameters

### T

`T` = `any`

The type of values in the entries.

## Implements

- `IterableIterator`\<[`Entry`](../type-aliases/Entry.md)\<`T`\>\>

## Constructors

### Constructor

> **new EntriesIterator**\<`T`\>(`target`): `EntriesIterator`\<`T`\>

Defined in: packages/blue-core/src/iterable.ts:191

Creates an instance of EntriesIterator.

#### Parameters

##### target

`object`

The object or collection to iterate over its entries.

#### Returns

`EntriesIterator`\<`T`\>

## Methods

### \[iterator\]()

> **\[iterator\]**(): `IterableIterator`\<[`Entry`](../type-aliases/Entry.md)\<`T`\>\>

Defined in: packages/blue-core/src/iterable.ts:202

Returns the iterator itself, making this class compliant with the iterable protocol.

#### Returns

`IterableIterator`\<[`Entry`](../type-aliases/Entry.md)\<`T`\>\>

The current `EntriesIterator` instance.

#### Implementation of

`IterableIterator.[iterator]`

***

### next()

> **next**(): `IteratorResult`\<[`Entry`](../type-aliases/Entry.md)\<`T`\>\>

Defined in: packages/blue-core/src/iterable.ts:210

Returns the next entry in the iteration sequence.

#### Returns

`IteratorResult`\<[`Entry`](../type-aliases/Entry.md)\<`T`\>\>

An `IteratorResult` object containing the next entry and a `done` flag.

#### Implementation of

`IterableIterator.next`
