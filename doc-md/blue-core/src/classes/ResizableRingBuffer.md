[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / ResizableRingBuffer

# Class: ResizableRingBuffer\<T\>

Defined in: packages/blue-core/src/collection.ts:198

## Extends

- [`RingBuffer`](RingBuffer.md)\<`T`\>

## Type Parameters

### T

`T`

## Indexable

\[`n`: `number`\]: `T`

## Constructors

### Constructor

> **new ResizableRingBuffer**\<`T`\>(`elements`): `ResizableRingBuffer`\<`T`\>

Defined in: packages/blue-core/src/collection.ts:85

#### Parameters

##### elements

`ArrayLike`\<`T`\>

#### Returns

`ResizableRingBuffer`\<`T`\>

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`constructor`](RingBuffer.md#constructor)

### Constructor

> **new ResizableRingBuffer**\<`T`\>(`capacity`): `ResizableRingBuffer`\<`T`\>

Defined in: packages/blue-core/src/collection.ts:86

#### Parameters

##### capacity

`number`

#### Returns

`ResizableRingBuffer`\<`T`\>

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`constructor`](RingBuffer.md#constructor)

## Properties

### \_capacity

> `protected` **\_capacity**: `number`

Defined in: packages/blue-core/src/collection.ts:38

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`_capacity`](RingBuffer.md#_capacity)

---

### \_head

> `protected` **\_head**: `number`

Defined in: packages/blue-core/src/collection.ts:39

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`_head`](RingBuffer.md#_head)

---

### \_tail

> `protected` **\_tail**: `number`

Defined in: packages/blue-core/src/collection.ts:40

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`_tail`](RingBuffer.md#_tail)

---

### \_full

> `protected` **\_full**: `number`

Defined in: packages/blue-core/src/collection.ts:41

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`_full`](RingBuffer.md#_full)

---

### MAX_CAPACITY

> `readonly` `static` **MAX_CAPACITY**: `number`

Defined in: packages/blue-core/src/collection.ts:43

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`MAX_CAPACITY`](RingBuffer.md#max_capacity)

---

### MIN_CAPACITY

> `readonly` `static` **MIN_CAPACITY**: `number`

Defined in: packages/blue-core/src/collection.ts:44

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`MIN_CAPACITY`](RingBuffer.md#min_capacity)

## Accessors

### capacity

#### Get Signature

> **get** **capacity**(): `number`

Defined in: packages/blue-core/src/collection.ts:52

##### Returns

`number`

#### Set Signature

> **set** **capacity**(`newCapacity`): `void`

Defined in: packages/blue-core/src/collection.ts:56

##### Parameters

###### newCapacity

`number`

##### Returns

`void`

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`capacity`](RingBuffer.md#capacity)

---

### isEmpty

#### Get Signature

> **get** **isEmpty**(): `boolean`

Defined in: packages/blue-core/src/collection.ts:64

##### Returns

`boolean`

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`isEmpty`](RingBuffer.md#isempty)

---

### isFull

#### Get Signature

> **get** **isFull**(): `boolean`

Defined in: packages/blue-core/src/collection.ts:68

##### Returns

`boolean`

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`isFull`](RingBuffer.md#isfull)

---

### length

#### Get Signature

> **get** **length**(): `number`

Defined in: packages/blue-core/src/collection.ts:72

##### Returns

`number`

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`length`](RingBuffer.md#length)

---

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-core/src/collection.ts:199

##### Returns

`string`

#### Overrides

[`RingBuffer`](RingBuffer.md).[`[toStringTag]`](RingBuffer.md#tostringtag)

## Methods

### \[iterator\]()

> **\[iterator\]**(): `Iterator`\<`T`, `any`, `undefined`\>

Defined in: packages/blue-core/src/collection.ts:123

#### Returns

`Iterator`\<`T`, `any`, `undefined`\>

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`[iterator]`](RingBuffer.md#iterator)

---

### get()

> **get**(): `T`

Defined in: packages/blue-core/src/collection.ts:127

#### Returns

`T`

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`get`](RingBuffer.md#get)

---

### toJSON()

> **toJSON**(): [`JSONArray`](../interfaces/JSONArray.md)

Defined in: packages/blue-core/src/collection.ts:166

#### Returns

[`JSONArray`](../interfaces/JSONArray.md)

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`toJSON`](RingBuffer.md#tojson)

---

### toString()

> **toString**(): `string`

Defined in: packages/blue-core/src/collection.ts:176

Returns a string representation of an object.

#### Returns

`string`

#### Inherited from

[`RingBuffer`](RingBuffer.md).[`toString`](RingBuffer.md#tostring)

---

### put()

> **put**(...`items`): `number`

Defined in: packages/blue-core/src/collection.ts:207

#### Parameters

##### items

...`T`[]

#### Returns

`number`

The number of items

#### Overrides

[`RingBuffer`](RingBuffer.md).[`put`](RingBuffer.md#put)

---

### resizeTo()

> **resizeTo**(`newCapacity`): `void`

Defined in: packages/blue-core/src/collection.ts:223

#### Parameters

##### newCapacity

`number`

#### Returns

`void`

The number of items
