[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [ring-buffer](../README.md) / RingBuffer

# Class: RingBuffer\<T\>

A value that can safely be converted to a string or JSON payload.

## Extended by

- [`MutablePropertyValues`](../../property-value/classes/MutablePropertyValues.md)

## Type Parameters

### T

`T` = `unknown`

## Implements

- `ArrayLike`\<`T` \| `undefined`\>
- `Iterable`\<`T`\>
- [`Serializable`](../../serializable/interfaces/Serializable.md)

## Indexable

> \[`n`: `number`\]: `T` \| `undefined`

## Constructors

### Constructor

> **new RingBuffer**\<`T`\>(`elements`): `RingBuffer`\<`T`\>

Creates a new RingBuffer instance.

#### Parameters

##### elements

`ArrayLike`\<`T`\>

An array-like object to initialize the buffer with.

#### Returns

`RingBuffer`\<`T`\>

### Constructor

> **new RingBuffer**\<`T`\>(`capacity`): `RingBuffer`\<`T`\>

Creates a new RingBuffer instance with a specified capacity.

#### Parameters

##### capacity

`number`

The initial capacity of the buffer.

#### Returns

`RingBuffer`\<`T`\>

## Properties

### MAX\_CAPACITY

> `readonly` `static` **MAX\_CAPACITY**: `number`

The maximum capacity of any RingBuffer instance.

***

### MIN\_CAPACITY

> `readonly` `static` **MIN\_CAPACITY**: `number`

The minimum capacity of any RingBuffer instance.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

The string tag for this class.

##### Returns

`string`

***

### capacity

#### Get Signature

> **get** **capacity**(): `number`

The current capacity of the ring buffer.

##### Returns

`number`

#### Set Signature

> **set** **capacity**(`newCapacity`): `void`

Sets the capacity of the ring buffer. The new capacity will be a power of 2
between `MIN_CAPACITY` and `MAX_CAPACITY`.

##### Parameters

###### newCapacity

`number`

The desired new capacity.

##### Returns

`void`

***

### isEmpty

#### Get Signature

> **get** **isEmpty**(): `boolean`

Indicates if the ring buffer is empty.

##### Returns

`boolean`

***

### isFull

#### Get Signature

> **get** **isFull**(): `boolean`

Indicates if the ring buffer is full.

##### Returns

`boolean`

***

### length

#### Get Signature

> **get** **length**(): `number`

The number of elements currently in the ring buffer.

##### Returns

`number`

#### Implementation of

`ArrayLike.length`

## Methods

### \[iterator\]()

> **\[iterator\]**(): `Iterator`\<`T`, `undefined`, `undefined`\>

Returns an iterator for the elements in the ring buffer, oldest
first. Walks `tail → head` across the wrap so every live element is
visited — the previous index-walk missed elements whose ring slots
sat past the wrap.

#### Returns

`Iterator`\<`T`, `undefined`, `undefined`\>

An iterator for the elements.

#### Implementation of

`Iterable.[iterator]`

***

### get()

> **get**(): `T` \| `undefined`

Retrieves and removes the oldest element from the ring buffer.

#### Returns

`T` \| `undefined`

The oldest element, or `undefined` if the buffer is empty.

***

### peek()

> **peek**(): `T` \| `undefined`

Returns the oldest element (tail position) without removing it.

#### Returns

`T` \| `undefined`

The oldest element, or `undefined` if the buffer is empty.

***

### peekHead()

> **peekHead**(): `T` \| `undefined`

Returns the newest element (most recently added, head-1 position) without removing it.

#### Returns

`T` \| `undefined`

The newest element, or `undefined` if the buffer is empty.

***

### put()

> **put**(...`items`): `number`

Adds one or more elements to the ring buffer. If the buffer is full,
the oldest elements will be overwritten.

#### Parameters

##### items

...`T`[]

The elements to add.

#### Returns

`number`

The new length of the ring buffer.

***

### toJSON()

> **toJSON**(): [`JSONArray`](../../serializable/interfaces/JSONArray.md)

Returns a JSON array representation of the ring buffer's contents,
oldest first (walks tail → head like the iterator — the previous
numeric slot walk dropped elements past the wrap).

#### Returns

[`JSONArray`](../../serializable/interfaces/JSONArray.md)

A JSON array.

#### Implementation of

[`Serializable`](../../serializable/interfaces/Serializable.md).[`toJSON`](../../serializable/interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Returns a string representation of the ring buffer's contents.

#### Returns

`string`

A comma-separated string of the elements.

#### Implementation of

[`Serializable`](../../serializable/interfaces/Serializable.md).[`toString`](../../serializable/interfaces/Serializable.md#tostring)
