[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [deque](../README.md) / Deque

# Class: Deque\<T\>

A value that can safely be converted to a string or JSON payload.

## Type Parameters

### T

`T`

## Implements

- `ArrayLike`\<`T` \| `undefined`\>
- `Iterable`\<`T`\>
- [`Serializable`](../../serializable/interfaces/Serializable.md)
- [`Equatable`](../../equatable/interfaces/Equatable.md)\<`Deque`\<`T`\>\>

## Indexable

> \[`n`: `number`\]: `T` \| `undefined`

## Constructors

### Constructor

> **new Deque**\<`T`\>(`capacity?`): `Deque`\<`T`\>

#### Parameters

##### capacity?

`number` = `16`

#### Returns

`Deque`\<`T`\>

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

***

### capacity

#### Get Signature

> **get** **capacity**(): `number`

Allocated slots before the buffer grows.

##### Returns

`number`

***

### length

#### Get Signature

> **get** **length**(): `number`

Number of values in the deque.

##### Returns

`number`

#### Implementation of

`ArrayLike.length`

## Methods

### \[iterator\]()

> **\[iterator\]**(): `Iterator`\<`T`, `undefined`, `undefined`\>

Yields values front to back.

#### Returns

`Iterator`\<`T`, `undefined`, `undefined`\>

#### Implementation of

`Iterable.[iterator]`

***

### clear()

> **clear**(): `void`

Removes every value, keeping the allocated capacity.

#### Returns

`void`

***

### equals()

> **equals**(`value`): `boolean`

Compares values position by position.

#### Parameters

##### value

`unknown`

The candidate to compare against.

#### Returns

`boolean`

`true` when both deques hold equal values in the same order.

#### Implementation of

[`Equatable`](../../equatable/interfaces/Equatable.md).[`equals`](../../equatable/interfaces/Equatable.md#equals)

***

### get()

> **get**(`index`): `T` \| `undefined`

Reads a value by position.

#### Parameters

##### index

`number`

Zero-based position from the front.

#### Returns

`T` \| `undefined`

The value at `index`, or `undefined` when out of range.

***

### peekBack()

> **peekBack**(): `T` \| `undefined`

Returns the back value without removing it.

#### Returns

`T` \| `undefined`

The back value, or `undefined` when the deque is empty.

***

### peekFront()

> **peekFront**(): `T` \| `undefined`

Returns the front value without removing it.

#### Returns

`T` \| `undefined`

The front value, or `undefined` when the deque is empty.

***

### pop()

> **pop**(): `T` \| `undefined`

Removes and returns the back value.

#### Returns

`T` \| `undefined`

The back value, or `undefined` when the deque is empty.

***

### push()

> **push**(`value`): `this`

Appends a value to the back.

#### Parameters

##### value

`T`

The value to append.

#### Returns

`this`

This deque, for chaining.

***

### remove()

> **remove**(`value`): `boolean`

Removes the first occurrence of `value` (by `===`). O(n). Intended for
rare removals (e.g. promoting a cached entry to permanent storage).

#### Parameters

##### value

`T`

The value to remove.

#### Returns

`boolean`

`true` when a value was removed.

***

### shift()

> **shift**(): `T` \| `undefined`

Removes and returns the front value.

#### Returns

`T` \| `undefined`

The front value, or `undefined` when the deque is empty.

***

### toArray()

> **toArray**(): `T`[]

Copies the values into a plain array, front to back.

#### Returns

`T`[]

A new array of the deque's values.

***

### toJSON()

> **toJSON**(): [`JSONArray`](../../serializable/interfaces/JSONArray.md)

Returns the JSON form, front to back.

#### Returns

[`JSONArray`](../../serializable/interfaces/JSONArray.md)

A JSON array of the deque's values.

#### Implementation of

[`Serializable`](../../serializable/interfaces/Serializable.md).[`toJSON`](../../serializable/interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Renders the values front to back as a comma-separated string.

#### Returns

`string`

The serialized values.

#### Implementation of

[`Serializable`](../../serializable/interfaces/Serializable.md).[`toString`](../../serializable/interfaces/Serializable.md#tostring)

***

### unshift()

> **unshift**(`value`): `this`

Prepends a value to the front.

#### Parameters

##### value

`T`

The value to prepend.

#### Returns

`this`

This deque, for chaining.
