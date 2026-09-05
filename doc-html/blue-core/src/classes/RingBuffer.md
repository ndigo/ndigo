[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / RingBuffer

# Class: RingBuffer\<T\>

Defined in: [packages/blue-core/src/ring-buffer.ts:23](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/ring-buffer.ts#lines-23)

A value that can safely be converted to a string or JSON payload.

## Extended by

- [`MutablePropertyValues`](MutablePropertyValues.md)

## Type Parameters

### T

`T` = `any`

## Implements

- `ArrayLike`\<`T` \| `undefined`\>
- `Iterable`\<`T`\>
- [`Serializable`](../interfaces/Serializable.md)

## Indexable

> \[`n`: `number`\]: `T` \| `undefined`

## Constructors

### Constructor

> **new RingBuffer**\<`T`\>(`elements`): `RingBuffer`\<`T`\>

Defined in: [packages/blue-core/src/ring-buffer.ts:101](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/ring-buffer.ts#lines-101)

Creates a new RingBuffer instance.

#### Parameters

##### elements

`ArrayLike`\<`T`\>

An array-like object to initialize the buffer with.

#### Returns

`RingBuffer`\<`T`\>

### Constructor

> **new RingBuffer**\<`T`\>(`capacity`): `RingBuffer`\<`T`\>

Defined in: [packages/blue-core/src/ring-buffer.ts:106](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/ring-buffer.ts#lines-106)

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

Defined in: [packages/blue-core/src/ring-buffer.ts:24](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/ring-buffer.ts#lines-24)

***

### \_head

> `protected` **\_head**: `number`

Defined in: [packages/blue-core/src/ring-buffer.ts:25](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/ring-buffer.ts#lines-25)

***

### \_tail

> `protected` **\_tail**: `number`

Defined in: [packages/blue-core/src/ring-buffer.ts:26](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/ring-buffer.ts#lines-26)

***

### \_full

> `protected` **\_full**: `number`

Defined in: [packages/blue-core/src/ring-buffer.ts:27](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/ring-buffer.ts#lines-27)

***

### MAX\_CAPACITY

> `readonly` `static` **MAX\_CAPACITY**: `number`

Defined in: [packages/blue-core/src/ring-buffer.ts:32](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/ring-buffer.ts#lines-32)

The maximum capacity of any RingBuffer instance.

***

### MIN\_CAPACITY

> `readonly` `static` **MIN\_CAPACITY**: `number`

Defined in: [packages/blue-core/src/ring-buffer.ts:36](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/ring-buffer.ts#lines-36)

The minimum capacity of any RingBuffer instance.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-core/src/ring-buffer.ts:43](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/ring-buffer.ts#lines-43)

The string tag for this class.

##### Returns

`string`

***

### capacity

#### Get Signature

> **get** **capacity**(): `number`

Defined in: [packages/blue-core/src/ring-buffer.ts:50](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/ring-buffer.ts#lines-50)

The current capacity of the ring buffer.

##### Returns

`number`

#### Set Signature

> **set** **capacity**(`newCapacity`): `void`

Defined in: [packages/blue-core/src/ring-buffer.ts:59](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/ring-buffer.ts#lines-59)

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

Defined in: [packages/blue-core/src/ring-buffer.ts:70](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/ring-buffer.ts#lines-70)

Indicates if the ring buffer is empty.

##### Returns

`boolean`

***

### isFull

#### Get Signature

> **get** **isFull**(): `boolean`

Defined in: [packages/blue-core/src/ring-buffer.ts:77](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/ring-buffer.ts#lines-77)

Indicates if the ring buffer is full.

##### Returns

`boolean`

***

### length

#### Get Signature

> **get** **length**(): `number`

Defined in: [packages/blue-core/src/ring-buffer.ts:84](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/ring-buffer.ts#lines-84)

The number of elements currently in the ring buffer.

##### Returns

`number`

#### Implementation of

`ArrayLike.length`

## Methods

### \[iterator\]()

> **\[iterator\]**(): `Iterator`\<`T`, `any`, `undefined`\>

Defined in: [packages/blue-core/src/ring-buffer.ts:153](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/ring-buffer.ts#lines-153)

Returns an iterator for the elements in the ring buffer.

#### Returns

`Iterator`\<`T`, `any`, `undefined`\>

An iterator for the elements.

#### Implementation of

`Iterable.[iterator]`

***

### get()

> **get**(): `T` \| `undefined`

Defined in: [packages/blue-core/src/ring-buffer.ts:161](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/ring-buffer.ts#lines-161)

Retrieves and removes the oldest element from the ring buffer.

#### Returns

`T` \| `undefined`

The oldest element, or `undefined` if the buffer is empty.

***

### peek()

> **peek**(): `T` \| `undefined`

Defined in: [packages/blue-core/src/ring-buffer.ts:179](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/ring-buffer.ts#lines-179)

Returns the oldest element (tail position) without removing it.

#### Returns

`T` \| `undefined`

The oldest element, or `undefined` if the buffer is empty.

***

### peekHead()

> **peekHead**(): `T` \| `undefined`

Defined in: [packages/blue-core/src/ring-buffer.ts:188](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/ring-buffer.ts#lines-188)

Returns the newest element (most recently added, head-1 position) without removing it.

#### Returns

`T` \| `undefined`

The newest element, or `undefined` if the buffer is empty.

***

### put()

> **put**(...`items`): `number`

Defined in: [packages/blue-core/src/ring-buffer.ts:199](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/ring-buffer.ts#lines-199)

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

Defined in: [packages/blue-core/src/ring-buffer.ts:228](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/ring-buffer.ts#lines-228)

Returns a JSON array representation of the ring buffer's contents.

#### Returns

[`JSONArray`](../interfaces/JSONArray.md)

A JSON array.

#### Implementation of

[`Serializable`](../interfaces/Serializable.md).[`toJSON`](../interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: [packages/blue-core/src/ring-buffer.ts:242](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/ring-buffer.ts#lines-242)

Returns a string representation of the ring buffer's contents.

#### Returns

`string`

A comma-separated string of the elements.

#### Implementation of

[`Serializable`](../interfaces/Serializable.md).[`toString`](../interfaces/Serializable.md#tostring)
