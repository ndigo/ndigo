[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / RingBuffer

# Class: RingBuffer\<T\>

Defined in: packages/blue-core/src/collection.ts:37

## Implements

external:ArrayLike

## Implements

external:Iterable

## Extended by

- [`ResizableRingBuffer`](ResizableRingBuffer.md)

## Type Parameters

### T

`T` = `any`

## Implements

- `ArrayLike`\<`T`\>
- `Iterable`\<`T`\>
- [`Serializable`](../interfaces/Serializable.md)

## Indexable

\[`n`: `number`\]: `T`

## Constructors

### Constructor

> **new RingBuffer**\<`T`\>(`elements`): `RingBuffer`\<`T`\>

Defined in: packages/blue-core/src/collection.ts:85

#### Parameters

##### elements

`ArrayLike`\<`T`\>

#### Returns

`RingBuffer`\<`T`\>

### Constructor

> **new RingBuffer**\<`T`\>(`capacity`): `RingBuffer`\<`T`\>

Defined in: packages/blue-core/src/collection.ts:86

#### Parameters

##### capacity

`number`

#### Returns

`RingBuffer`\<`T`\>

## Properties

### \_capacity

> `protected` **\_capacity**: `number`

Defined in: packages/blue-core/src/collection.ts:38

***

### \_head

> `protected` **\_head**: `number`

Defined in: packages/blue-core/src/collection.ts:39

***

### \_tail

> `protected` **\_tail**: `number`

Defined in: packages/blue-core/src/collection.ts:40

***

### \_full

> `protected` **\_full**: `number`

Defined in: packages/blue-core/src/collection.ts:41

***

### MAX\_CAPACITY

> `readonly` `static` **MAX\_CAPACITY**: `number`

Defined in: packages/blue-core/src/collection.ts:43

***

### MIN\_CAPACITY

> `readonly` `static` **MIN\_CAPACITY**: `number`

Defined in: packages/blue-core/src/collection.ts:44

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-core/src/collection.ts:48

##### Returns

`string`

***

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

***

### isEmpty

#### Get Signature

> **get** **isEmpty**(): `boolean`

Defined in: packages/blue-core/src/collection.ts:64

##### Returns

`boolean`

***

### isFull

#### Get Signature

> **get** **isFull**(): `boolean`

Defined in: packages/blue-core/src/collection.ts:68

##### Returns

`boolean`

***

### length

#### Get Signature

> **get** **length**(): `number`

Defined in: packages/blue-core/src/collection.ts:72

##### Returns

`number`

#### Implementation of

`ArrayLike.length`

## Methods

### \[iterator\]()

> **\[iterator\]**(): `Iterator`\<`T`, `any`, `undefined`\>

Defined in: packages/blue-core/src/collection.ts:123

#### Returns

`Iterator`\<`T`, `any`, `undefined`\>

#### Implementation of

`Iterable.[iterator]`

***

### get()

> **get**(): `T`

Defined in: packages/blue-core/src/collection.ts:127

#### Returns

`T`

***

### put()

> **put**(...`items`): `number`

Defined in: packages/blue-core/src/collection.ts:141

#### Parameters

##### items

...`T`[]

#### Returns

`number`

***

### toJSON()

> **toJSON**(): [`JSONArray`](../interfaces/JSONArray.md)

Defined in: packages/blue-core/src/collection.ts:166

#### Returns

[`JSONArray`](../interfaces/JSONArray.md)

#### Implementation of

[`Serializable`](../interfaces/Serializable.md).[`toJSON`](../interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-core/src/collection.ts:176

Returns a string representation of an object.

#### Returns

`string`

#### Implementation of

[`Serializable`](../interfaces/Serializable.md).[`toString`](../interfaces/Serializable.md#tostring)
