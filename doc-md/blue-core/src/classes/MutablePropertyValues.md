[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / MutablePropertyValues

# Class: MutablePropertyValues

Defined in: packages/blue-core/src/property-value.ts:121

A mutable collection of named property values.

## Extends

- [`RingBuffer`](RingBuffer.md)\<[`PropertyValue`](PropertyValue.md)\>

## Implements

- `ArrayLike`\<[`PropertyValue`](PropertyValue.md)\>
- [`Equatable`](../interfaces/Equatable.md)
- `Iterable`\<[`PropertyValue`](PropertyValue.md)\>
- [`Serializable`](../interfaces/Serializable.md)

## Indexable

> \[`n`: `number`\]: [`PropertyValue`](PropertyValue.md)

## Constructors

### Constructor

> **new MutablePropertyValues**(`properties?`): `MutablePropertyValues`

Defined in: packages/blue-core/src/property-value.ts:142

Creates a collection seeded with existing property values.

#### Parameters

##### properties?

`Iterable`\<[`PropertyValue`](PropertyValue.md)\>

Optional source collection to copy into this buffer.

#### Returns

`MutablePropertyValues`

#### Overrides

[`RingBuffer`](RingBuffer.md).[`constructor`](RingBuffer.md#constructor)

## Properties

### \_capacity

> `protected` **\_capacity**: `number`

Defined in: packages/blue-core/src/collection.ts:29

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`_capacity`](RingBuffer.md#_capacity)

***

### \_head

> `protected` **\_head**: `number`

Defined in: packages/blue-core/src/collection.ts:30

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`_head`](RingBuffer.md#_head)

***

### \_tail

> `protected` **\_tail**: `number`

Defined in: packages/blue-core/src/collection.ts:31

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`_tail`](RingBuffer.md#_tail)

***

### \_full

> `protected` **\_full**: `number`

Defined in: packages/blue-core/src/collection.ts:32

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`_full`](RingBuffer.md#_full)

***

### MAX\_CAPACITY

> `readonly` `static` **MAX\_CAPACITY**: `number`

Defined in: packages/blue-core/src/collection.ts:37

The maximum capacity of any RingBuffer instance.

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`MAX_CAPACITY`](RingBuffer.md#max_capacity)

***

### MIN\_CAPACITY

> `readonly` `static` **MIN\_CAPACITY**: `number`

Defined in: packages/blue-core/src/collection.ts:41

The minimum capacity of any RingBuffer instance.

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`MIN_CAPACITY`](RingBuffer.md#min_capacity)

## Accessors

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

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`capacity`](RingBuffer.md#capacity)

***

### isEmpty

#### Get Signature

> **get** **isEmpty**(): `boolean`

Defined in: packages/blue-core/src/collection.ts:75

Indicates if the ring buffer is empty.

##### Returns

`boolean`

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`isEmpty`](RingBuffer.md#isempty)

***

### isFull

#### Get Signature

> **get** **isFull**(): `boolean`

Defined in: packages/blue-core/src/collection.ts:82

Indicates if the ring buffer is full.

##### Returns

`boolean`

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`isFull`](RingBuffer.md#isfull)

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

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`length`](RingBuffer.md#length)

***

### propertyValues

#### Get Signature

> **get** **propertyValues**(): [`PropertyValue`](PropertyValue.md)[]

Defined in: packages/blue-core/src/property-value.ts:126

All property values in iteration order.

##### Returns

[`PropertyValue`](PropertyValue.md)[]

***

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-core/src/property-value.ts:133

The stable string tag for this collection.

##### Returns

`string`

#### Overrides

[`RingBuffer`](RingBuffer.md).[`[toStringTag]`](RingBuffer.md#tostringtag)

## Methods

### \[iterator\]()

> **\[iterator\]**(): `Iterator`\<[`PropertyValue`](PropertyValue.md), `any`, `undefined`\>

Defined in: packages/blue-core/src/collection.ts:156

Returns an iterator for the elements in the ring buffer.

#### Returns

`Iterator`\<[`PropertyValue`](PropertyValue.md), `any`, `undefined`\>

An iterator for the elements.

#### Implementation of

`Iterable.[iterator]`

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`[iterator]`](RingBuffer.md#iterator)

***

### get()

> **get**(): [`PropertyValue`](PropertyValue.md)

Defined in: packages/blue-core/src/collection.ts:164

Retrieves and removes the oldest element from the ring buffer.

#### Returns

[`PropertyValue`](PropertyValue.md)

The oldest element, or `undefined` if the buffer is empty.

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`get`](RingBuffer.md#get)

***

### put()

> **put**(...`items`): `number`

Defined in: packages/blue-core/src/collection.ts:184

Adds one or more elements to the ring buffer. If the buffer is full,
the oldest elements will be overwritten.

#### Parameters

##### items

...[`PropertyValue`](PropertyValue.md)[]

The elements to add.

#### Returns

`number`

The new length of the ring buffer.

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`put`](RingBuffer.md#put)

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

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`toJSON`](RingBuffer.md#tojson)

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

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`toString`](RingBuffer.md#tostring)

***

### addPropertyValue()

#### Call Signature

> **addPropertyValue**(`name`, `value`): `any`

Defined in: packages/blue-core/src/property-value.ts:157

Adds a property value to the collection.

##### Parameters

###### name

`string`

Property name.

###### value

`any`

Property value.

##### Returns

`any`

#### Call Signature

> **addPropertyValue**(`pv`): `any`

Defined in: packages/blue-core/src/property-value.ts:164

Adds a pre-built property value to the collection.

##### Parameters

###### pv

[`PropertyValue`](PropertyValue.md)

Property value to add.

##### Returns

`any`

***

### equals()

> **equals**(`value`): `boolean`

Defined in: packages/blue-core/src/property-value.ts:180

Compares this collection to another property collection.

#### Parameters

##### value

`any`

Value to compare.

#### Returns

`boolean`

`true` when both collections contain the same property names and values.

#### Implementation of

[`Equatable`](../interfaces/Equatable.md).[`equals`](../interfaces/Equatable.md#equals)

***

### getValue()

> **getValue**(`propertyName`): `any`

Defined in: packages/blue-core/src/property-value.ts:203

Retrieves only the wrapped value for a named property.

#### Parameters

##### propertyName

`string`

Property name to resolve.

#### Returns

`any`

The stored value, or `null` when the property is missing.

***

### getPropertyValue()

> **getPropertyValue**(`propertyName`): [`PropertyValue`](PropertyValue.md)

Defined in: packages/blue-core/src/property-value.ts:214

Finds a property value by name.

#### Parameters

##### propertyName

`string`

Property name to resolve.

#### Returns

[`PropertyValue`](PropertyValue.md)

The matching property value, or `null` when no match exists.
