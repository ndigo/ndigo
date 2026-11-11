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

##### Returns

`number`

***

### length

#### Get Signature

> **get** **length**(): `number`

##### Returns

`number`

#### Implementation of

`ArrayLike.length`

## Methods

### \[iterator\]()

> **\[iterator\]**(): `Iterator`\<`T`, `undefined`, `undefined`\>

#### Returns

`Iterator`\<`T`, `undefined`, `undefined`\>

#### Implementation of

`Iterable.[iterator]`

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

### get()

> **get**(`index`): `T` \| `undefined`

#### Parameters

##### index

`number`

#### Returns

`T` \| `undefined`

***

### peekBack()

> **peekBack**(): `T` \| `undefined`

#### Returns

`T` \| `undefined`

***

### peekFront()

> **peekFront**(): `T` \| `undefined`

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

### remove()

> **remove**(`value`): `boolean`

Removes the first occurrence of `value` (by `===`). O(n). Intended for
rare removals (e.g. promoting a cached entry to permanent storage).

#### Parameters

##### value

`T`

#### Returns

`boolean`

`true` when a value was removed.

***

### shift()

> **shift**(): `T` \| `undefined`

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

Returns a JSON-safe representation of the value.

#### Returns

[`JSONArray`](../../serializable/interfaces/JSONArray.md)

#### Implementation of

[`Serializable`](../../serializable/interfaces/Serializable.md).[`toJSON`](../../serializable/interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Returns a string representation of an object.

#### Returns

`string`

#### Implementation of

[`Serializable`](../../serializable/interfaces/Serializable.md).[`toString`](../../serializable/interfaces/Serializable.md#tostring)

***

### unshift()

> **unshift**(`value`): `this`

#### Parameters

##### value

`T`

#### Returns

`this`
