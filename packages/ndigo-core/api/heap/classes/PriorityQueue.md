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

##### Returns

`number`

## Methods

### \[iterator\]()

> **\[iterator\]**(): `Iterator`\<`T`\>

#### Returns

`Iterator`\<`T`\>

***

### clear()

> **clear**(): `void`

#### Returns

`void`

***

### dequeue()

> **dequeue**(): `T` \| `undefined`

#### Returns

`T` \| `undefined`

***

### enqueue()

> **enqueue**(`value`): `this`

#### Parameters

##### value

`T`

#### Returns

`this`

***

### peek()

> **peek**(): `T` \| `undefined`

#### Returns

`T` \| `undefined`

***

### toArray()

> **toArray**(): `T`[]

#### Returns

`T`[]

***

### toJSON()

> **toJSON**(): [`JSONArray`](../../serializable/interfaces/JSONArray.md)

#### Returns

[`JSONArray`](../../serializable/interfaces/JSONArray.md)

***

### toSorted()

> **toSorted**(): `T`[]

#### Returns

`T`[]

***

### toString()

> **toString**(): `string`

#### Returns

`string`
