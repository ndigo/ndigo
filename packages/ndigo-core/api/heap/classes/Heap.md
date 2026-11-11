[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [heap](../README.md) / Heap

# Class: Heap\<T\>

A value that can safely be converted to a string or JSON payload.

## Type Parameters

### T

`T`

## Implements

- [`Serializable`](../../serializable/interfaces/Serializable.md)
- [`Equatable`](../../equatable/interfaces/Equatable.md)\<`Heap`\<`T`\>\>

## Constructors

### Constructor

> **new Heap**\<`T`\>(`compare?`): `Heap`\<`T`\>

#### Parameters

##### compare?

[`comparison`](../../comparable/type-aliases/comparison.md)\<`T`\> = `...`

#### Returns

`Heap`\<`T`\>

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

***

### size

#### Get Signature

> **get** **size**(): `number`

Number of stored values.

##### Returns

`number`

## Methods

### \[iterator\]()

> **\[iterator\]**(): `Iterator`\<`T`\>

Yields values in internal heap order.

#### Returns

`Iterator`\<`T`\>

***

### clear()

> **clear**(): `void`

Removes every value.

#### Returns

`void`

***

### equals()

> **equals**(`value`): `boolean`

Compares the sorted contents, independent of internal layout.

#### Parameters

##### value

`unknown`

The candidate to compare against.

#### Returns

`boolean`

`true` when both heaps hold equal values in comparator order.

#### Implementation of

[`Equatable`](../../equatable/interfaces/Equatable.md).[`equals`](../../equatable/interfaces/Equatable.md#equals)

***

### peek()

> **peek**(): `T` \| `undefined`

Returns the root without removing it.

#### Returns

`T` \| `undefined`

The root value, or `undefined` when the heap is empty.

***

### pop()

> **pop**(): `T` \| `undefined`

Removes and returns the root (smallest by the comparator).

#### Returns

`T` \| `undefined`

The root value, or `undefined` when the heap is empty.

***

### push()

> **push**(`value`): `this`

Inserts a value.

#### Parameters

##### value

`T`

The value to insert.

#### Returns

`this`

This heap, for chaining.

***

### toArray()

> **toArray**(): `T`[]

Copies the values in internal heap order.

#### Returns

`T`[]

A new array of the stored values.

***

### toJSON()

> **toJSON**(): [`JSONArray`](../../serializable/interfaces/JSONArray.md)

Returns the JSON form in internal heap order.

#### Returns

[`JSONArray`](../../serializable/interfaces/JSONArray.md)

A JSON array of the stored values.

#### Implementation of

[`Serializable`](../../serializable/interfaces/Serializable.md).[`toJSON`](../../serializable/interfaces/Serializable.md#tojson)

***

### toSorted()

> **toSorted**(): `T`[]

Copies and sorts the values by the heap's comparator.

#### Returns

`T`[]

A new array in comparator order.

***

### toString()

> **toString**(): `string`

Renders the values as a comma-separated string.

#### Returns

`string`

The serialized values.

#### Implementation of

[`Serializable`](../../serializable/interfaces/Serializable.md).[`toString`](../../serializable/interfaces/Serializable.md#tostring)
