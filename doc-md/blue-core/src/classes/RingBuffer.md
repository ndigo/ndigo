[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / RingBuffer

# Class: RingBuffer\<T\>

Defined in: packages/blue-core/src/collection.ts:28

## Implements

external:ArrayLike

## Implements

external:Iterable

## Implements

module:core.Serializable

## Extended by

- [`MutablePropertyValues`](MutablePropertyValues.md)

## Type Parameters

### T

`T` = `any`

## Implements

- `ArrayLike`\<`T`\>
- `Iterable`\<`T`\>
- [`Serializable`](../interfaces/Serializable.md)

## Indexable

> \[`n`: `number`\]: `T`

## Constructors

### Constructor

> **new RingBuffer**\<`T`\>(`elements`): `RingBuffer`\<`T`\>

Defined in: packages/blue-core/src/collection.ts:106

Creates a new RingBuffer instance.

#### Parameters

##### elements

`ArrayLike`\<`T`\>

An array-like object to initialize the buffer with.

#### Returns

`RingBuffer`\<`T`\>

### Constructor

> **new RingBuffer**\<`T`\>(`capacity`): `RingBuffer`\<`T`\>

Defined in: packages/blue-core/src/collection.ts:111

Creates a new RingBuffer instance with a specified capacity.

#### Parameters

##### capacity

`number`

The initial capacity of the buffer.

#### Returns

`RingBuffer`\<`T`\>

## Properties

### \_capacity

> `protected` **\_capacity**: `number`

Defined in: packages/blue-core/src/collection.ts:29

***

### \_head

> `protected` **\_head**: `number`

Defined in: packages/blue-core/src/collection.ts:30

***

### \_tail

> `protected` **\_tail**: `number`

Defined in: packages/blue-core/src/collection.ts:31

***

### \_full

> `protected` **\_full**: `number`

Defined in: packages/blue-core/src/collection.ts:32

***

### MAX\_CAPACITY

> `readonly` `static` **MAX\_CAPACITY**: `number`

Defined in: packages/blue-core/src/collection.ts:37

The maximum capacity of any RingBuffer instance.

***

### MIN\_CAPACITY

> `readonly` `static` **MIN\_CAPACITY**: `number`

Defined in: packages/blue-core/src/collection.ts:41

The minimum capacity of any RingBuffer instance.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-core/src/collection.ts:48

The string tag for this class.

##### Returns

`string`

***

### capacity

#### Get Signature

> **get** **capacity**(): `number`

Defined in: packages/blue-core/src/collection.ts:55

The current capacity of the ring buffer.

##### Returns

`number`

#### Set Signature

> **set** **capacity**(`newCapacity`): `void`

Defined in: packages/blue-core/src/collection.ts:64

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

Defined in: packages/blue-core/src/collection.ts:75

Indicates if the ring buffer is empty.

##### Returns

`boolean`

***

### isFull

#### Get Signature

> **get** **isFull**(): `boolean`

Defined in: packages/blue-core/src/collection.ts:82

Indicates if the ring buffer is full.

##### Returns

`boolean`

***

### length

#### Get Signature

> **get** **length**(): `number`

Defined in: packages/blue-core/src/collection.ts:89

The number of elements currently in the ring buffer.

##### Returns

`number`

#### Implementation of

`ArrayLike.length`

## Methods

### \[iterator\]()

> **\[iterator\]**(): `Iterator`\<`T`, `any`, `undefined`\>

Defined in: packages/blue-core/src/collection.ts:156

Returns an iterator for the elements in the ring buffer.

#### Returns

`Iterator`\<`T`, `any`, `undefined`\>

An iterator for the elements.

#### Implementation of

`Iterable.[iterator]`

***

### get()

> **get**(): `T`

Defined in: packages/blue-core/src/collection.ts:164

Retrieves and removes the oldest element from the ring buffer.

#### Returns

`T`

The oldest element, or `undefined` if the buffer is empty.

***

### put()

> **put**(...`items`): `number`

Defined in: packages/blue-core/src/collection.ts:184

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

> **toJSON**(): [`JSONArray`](../interfaces/JSONArray.md)

Defined in: packages/blue-core/src/collection.ts:213

Returns a JSON array representation of the ring buffer's contents.

#### Returns

[`JSONArray`](../interfaces/JSONArray.md)

A JSON array.

#### Implementation of

[`Serializable`](../interfaces/Serializable.md).[`toJSON`](../interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-core/src/collection.ts:227

Returns a string representation of the ring buffer's contents.

#### Returns

`string`

A comma-separated string of the elements.

#### Implementation of

[`Serializable`](../interfaces/Serializable.md).[`toString`](../interfaces/Serializable.md#tostring)
