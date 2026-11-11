[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [bloom-filter](../README.md) / BloomFilter

# Class: BloomFilter

A value that can safely be converted to a string or JSON payload.

## Implements

- [`Serializable`](../../serializable/interfaces/Serializable.md)
- [`Equatable`](../../equatable/interfaces/Equatable.md)\<`BloomFilter`\>

## Constructors

### Constructor

> **new BloomFilter**(`bits`, `hashes`): `BloomFilter`

#### Parameters

##### bits

`number`

##### hashes

`number`

#### Returns

`BloomFilter`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

***

### bitSize

#### Get Signature

> **get** **bitSize**(): `number`

##### Returns

`number`

***

### hashCount

#### Get Signature

> **get** **hashCount**(): `number`

##### Returns

`number`

***

### size

#### Get Signature

> **get** **size**(): `number`

##### Returns

`number`

## Methods

### add()

> **add**(`value`): `this`

#### Parameters

##### value

`unknown`

#### Returns

`this`

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

### has()

> **has**(`value`): `boolean`

#### Parameters

##### value

`unknown`

#### Returns

`boolean`

***

### toJSON()

> **toJSON**(): [`BloomFilterJSON`](../type-aliases/BloomFilterJSON.md)

Returns a JSON-safe representation of the value.

#### Returns

[`BloomFilterJSON`](../type-aliases/BloomFilterJSON.md)

#### Implementation of

[`Serializable`](../../serializable/interfaces/Serializable.md).[`toJSON`](../../serializable/interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Returns a string representation of the value.

#### Returns

`string`

#### Implementation of

[`Serializable`](../../serializable/interfaces/Serializable.md).[`toString`](../../serializable/interfaces/Serializable.md#tostring)

***

### fromJSON()

> `static` **fromJSON**(`json`): `BloomFilter`

#### Parameters

##### json

###### bits

`number`

###### buckets

`ArrayLike`\<`number`\>

###### count?

`number`

###### hashes

`number`

#### Returns

`BloomFilter`

***

### withTargetError()

> `static` **withTargetError**(`expectedItems`, `falsePositiveRate`): `BloomFilter`

#### Parameters

##### expectedItems

`number`

##### falsePositiveRate

`number`

#### Returns

`BloomFilter`
