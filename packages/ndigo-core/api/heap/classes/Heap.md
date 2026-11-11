[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [heap](../README.md) / Heap

# Class: Heap\<T\>

A value that can safely be converted to a string or JSON payload.

## Type Parameters

### T

`T`

## Implements

- [`Serializable`](../../serializable/interfaces/Serializable.md)
- [`Equatable`](../../equatable/interfaces/Equatable.md)\<`Heap`\<`T`\>\>

## Constructors

### Constructor

> **new Heap**\<`T`\>(`compare?`): `Heap`\<`T`\>

#### Parameters

##### compare?

[`comparison`](../../comparable/type-aliases/comparison.md)\<`T`\> = `...`

#### Returns

`Heap`\<`T`\>

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

***

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

### equals()

> **equals**(`value`): `boolean`

Determines if this object is equal to the specified value.

#### Parameters

##### value

`unknown`

The value to compare with this object.

#### Returns

`boolean`

`true` if the objects are equal, `false` otherwise.

#### Implementation of

[`Equatable`](../../equatable/interfaces/Equatable.md).[`equals`](../../equatable/interfaces/Equatable.md#equals)

***

### peek()

> **peek**(): `T` \| `undefined`

#### Returns

`T` \| `undefined`

***

### pop()

> **pop**(): `T` \| `undefined`

#### Returns

`T` \| `undefined`

***

### push()

> **push**(`value`): `this`

#### Parameters

##### value

`T`

#### Returns

`this`

***

### toArray()

> **toArray**(): `T`[]

#### Returns

`T`[]

***

### toJSON()

> **toJSON**(): [`JSONArray`](../../serializable/interfaces/JSONArray.md)

Returns a JSON-safe representation of the value.

#### Returns

[`JSONArray`](../../serializable/interfaces/JSONArray.md)

#### Implementation of

[`Serializable`](../../serializable/interfaces/Serializable.md).[`toJSON`](../../serializable/interfaces/Serializable.md#tojson)

***

### toSorted()

> **toSorted**(): `T`[]

#### Returns

`T`[]

***

### toString()

> **toString**(): `string`

Returns a string representation of the value.

#### Returns

`string`

#### Implementation of

[`Serializable`](../../serializable/interfaces/Serializable.md).[`toString`](../../serializable/interfaces/Serializable.md#tostring)
