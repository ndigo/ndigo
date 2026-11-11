[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [heap](../README.md) / PriorityQueue

# Class: PriorityQueue\<T\>

A priority queue backed by a [Heap](Heap.md): FIFO ordering is not
guaranteed for equal priorities (use a chained comparator to break ties).

## Type Parameters

### T

`T`

## Constructors

### Constructor

> **new PriorityQueue**\<`T`\>(`compare`): `PriorityQueue`\<`T`\>

#### Parameters

##### compare

[`comparison`](../../comparable/type-aliases/comparison.md)\<`T`\>

#### Returns

`PriorityQueue`\<`T`\>

## Accessors

### size

#### Get Signature

> **get** **size**(): `number`

Number of queued values.

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

Removes every queued value.

#### Returns

`void`

***

### dequeue()

> **dequeue**(): `T` \| `undefined`

Removes and returns the highest-priority value.

#### Returns

`T` \| `undefined`

The value that compares lowest, or `undefined` when empty.

***

### enqueue()

> **enqueue**(`value`): `this`

Adds a value to the queue.

#### Parameters

##### value

`T`

The value to enqueue.

#### Returns

`this`

This queue, for chaining.

***

### peek()

> **peek**(): `T` \| `undefined`

Returns the highest-priority value without removing it.

#### Returns

`T` \| `undefined`

The value that compares lowest, or `undefined` when empty.

***

### toArray()

> **toArray**(): `T`[]

Copies the values in internal heap order.

#### Returns

`T`[]

A new array of the queued values.

***

### toJSON()

> **toJSON**(): [`JSONArray`](../../serializable/interfaces/JSONArray.md)

Returns the JSON form in internal heap order.

#### Returns

[`JSONArray`](../../serializable/interfaces/JSONArray.md)

A JSON array of the queued values.

***

### toSorted()

> **toSorted**(): `T`[]

Copies and sorts the values by priority.

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
