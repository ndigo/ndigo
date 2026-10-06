[**@blue/core v0.0.1**](../README.md)

***

[@blue/core](../README.md) / MutablePropertyValues

# Class: MutablePropertyValues

A mutable collection of named property values.

## Extends

- [`RingBuffer`](RingBuffer.md)\<[`PropertyValue`](PropertyValue.md)\>

## Implements

- `ArrayLike`\<[`PropertyValue`](PropertyValue.md) \| `undefined`\>
- [`Equatable`](../interfaces/Equatable.md)
- `Iterable`\<[`PropertyValue`](PropertyValue.md)\>
- [`Serializable`](../interfaces/Serializable.md)

## Indexable

> \[`n`: `number`\]: [`PropertyValue`](PropertyValue.md) \| `undefined`

## Constructors

### Constructor

> **new MutablePropertyValues**(`properties?`): `MutablePropertyValues`

Creates a collection seeded with existing property values.

#### Parameters

##### properties?

`Iterable`\<[`PropertyValue`](PropertyValue.md), `any`, `any`\>

Optional source collection to copy into this buffer.

#### Returns

`MutablePropertyValues`

#### Overrides

[`RingBuffer`](RingBuffer.md).[`constructor`](RingBuffer.md#constructor)

## Properties

### MAX\_CAPACITY

> `readonly` `static` **MAX\_CAPACITY**: `number`

The maximum capacity of any RingBuffer instance.

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`MAX_CAPACITY`](RingBuffer.md#max_capacity)

***

### MIN\_CAPACITY

> `readonly` `static` **MIN\_CAPACITY**: `number`

The minimum capacity of any RingBuffer instance.

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`MIN_CAPACITY`](RingBuffer.md#min_capacity)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

The stable string tag for this collection.

##### Returns

`string`

#### Overrides

[`RingBuffer`](RingBuffer.md).[`[toStringTag]`](RingBuffer.md#tostringtag)

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

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`capacity`](RingBuffer.md#capacity)

***

### isEmpty

#### Get Signature

> **get** **isEmpty**(): `boolean`

Indicates if the ring buffer is empty.

##### Returns

`boolean`

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`isEmpty`](RingBuffer.md#isempty)

***

### isFull

#### Get Signature

> **get** **isFull**(): `boolean`

Indicates if the ring buffer is full.

##### Returns

`boolean`

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`isFull`](RingBuffer.md#isfull)

***

### length

#### Get Signature

> **get** **length**(): `number`

The number of elements currently in the ring buffer.

##### Returns

`number`

#### Implementation of

`ArrayLike.length`

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`length`](RingBuffer.md#length)

***

### propertyValues

#### Get Signature

> **get** **propertyValues**(): [`PropertyValue`](PropertyValue.md)[]

All property values in iteration order.

##### Returns

[`PropertyValue`](PropertyValue.md)[]

## Methods

### \[iterator\]()

> **\[iterator\]**(): `Iterator`\<[`PropertyValue`](PropertyValue.md), `undefined`, `undefined`\>

Returns an iterator for the elements in the ring buffer, oldest
first. Walks `tail → head` across the wrap so every live element is
visited — the previous index-walk missed elements whose ring slots
sat past the wrap.

#### Returns

`Iterator`\<[`PropertyValue`](PropertyValue.md), `undefined`, `undefined`\>

An iterator for the elements.

#### Implementation of

`Iterable.[iterator]`

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`[iterator]`](RingBuffer.md#iterator)

***

### addPropertyValue()

#### Call Signature

> **addPropertyValue**(`name`, `value`): `void`

Adds a property value to the collection.

##### Parameters

###### name

`string`

Property name.

###### value

`unknown`

Property value.

##### Returns

`void`

#### Call Signature

> **addPropertyValue**(`pv`): `void`

Adds a pre-built property value to the collection.

##### Parameters

###### pv

[`PropertyValue`](PropertyValue.md)

Property value to add.

##### Returns

`void`

***

### equals()

> **equals**(`value`): `boolean`

Compares this collection to another property collection.

#### Parameters

##### value

`unknown`

Value to compare.

#### Returns

`boolean`

`true` when both collections contain the same multiset of name/value pairs,
regardless of order; duplicate pairs must occur equally often.

#### Implementation of

[`Equatable`](../interfaces/Equatable.md).[`equals`](../interfaces/Equatable.md#equals)

***

### get()

> **get**(): [`PropertyValue`](PropertyValue.md) \| `undefined`

Retrieves and removes the oldest element from the ring buffer.

#### Returns

[`PropertyValue`](PropertyValue.md) \| `undefined`

The oldest element, or `undefined` if the buffer is empty.

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`get`](RingBuffer.md#get)

***

### getPropertyValue()

> **getPropertyValue**(`propertyName`): [`PropertyValue`](PropertyValue.md) \| `null`

Finds a property value by name.

#### Parameters

##### propertyName

`string`

Property name to resolve.

#### Returns

[`PropertyValue`](PropertyValue.md) \| `null`

The matching property value, or `null` when no match exists.

***

### getValue()

> **getValue**(`propertyName`): \{ \} \| `null`

Retrieves only the wrapped value for a named property.

#### Parameters

##### propertyName

`string`

Property name to resolve.

#### Returns

\{ \} \| `null`

The stored value, or `null` when the property is missing.

***

### peek()

> **peek**(): [`PropertyValue`](PropertyValue.md) \| `undefined`

Returns the oldest element (tail position) without removing it.

#### Returns

[`PropertyValue`](PropertyValue.md) \| `undefined`

The oldest element, or `undefined` if the buffer is empty.

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`peek`](RingBuffer.md#peek)

***

### peekHead()

> **peekHead**(): [`PropertyValue`](PropertyValue.md) \| `undefined`

Returns the newest element (most recently added, head-1 position) without removing it.

#### Returns

[`PropertyValue`](PropertyValue.md) \| `undefined`

The newest element, or `undefined` if the buffer is empty.

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`peekHead`](RingBuffer.md#peekhead)

***

### put()

> **put**(...`items`): `number`

Adds one or more property values, growing the backing buffer instead of
silently evicting the oldest entries. Unlike `RingBuffer`, a
`MutablePropertyValues` is an unbounded collection — a form can legitimately
carry far more than the ring's 32-slot default (KRN-REV-CORE-02).

#### Parameters

##### items

...[`PropertyValue`](PropertyValue.md)[]

The property values to add.

#### Returns

`number`

The new length of the collection.

#### Overrides

[`RingBuffer`](RingBuffer.md).[`put`](RingBuffer.md#put)

***

### toJSON()

> **toJSON**(): [`JSONArray`](../interfaces/JSONArray.md)

Returns a JSON array representation of the ring buffer's contents,
oldest first (walks tail → head like the iterator — the previous
numeric slot walk dropped elements past the wrap).

#### Returns

[`JSONArray`](../interfaces/JSONArray.md)

A JSON array.

#### Implementation of

[`Serializable`](../interfaces/Serializable.md).[`toJSON`](../interfaces/Serializable.md#tojson)

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`toJSON`](RingBuffer.md#tojson)

***

### toString()

> **toString**(): `string`

Returns a string representation of the ring buffer's contents.

#### Returns

`string`

A comma-separated string of the elements.

#### Implementation of

[`Serializable`](../interfaces/Serializable.md).[`toString`](../interfaces/Serializable.md#tostring)

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`toString`](RingBuffer.md#tostring)
