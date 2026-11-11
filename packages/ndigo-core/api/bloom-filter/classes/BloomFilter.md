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

Bit width of the filter (rounded up to a 32-bit boundary).

##### Returns

`number`

***

### hashCount

#### Get Signature

> **get** **hashCount**(): `number`

Number of hash functions applied per value.

##### Returns

`number`

***

### size

#### Get Signature

> **get** **size**(): `number`

Number of values added.

##### Returns

`number`

## Methods

### add()

> **add**(`value`): `this`

Adds a value to the filter.

#### Parameters

##### value

`unknown`

The value to record; hashed through its string form.

#### Returns

`this`

This filter, for chaining.

***

### clear()

> **clear**(): `void`

Clears every bit and resets the insertion count.

#### Returns

`void`

***

### equals()

> **equals**(`value`): `boolean`

Compares bit width, hash count, buckets, and insertion count.

#### Parameters

##### value

`unknown`

The candidate to compare against.

#### Returns

`boolean`

`true` when both filters hold identical state.

#### Implementation of

[`Equatable`](../../equatable/interfaces/Equatable.md).[`equals`](../../equatable/interfaces/Equatable.md#equals)

***

### has()

> **has**(`value`): `boolean`

Tests whether a value may have been added.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`boolean`

`false` when definitely absent; `true` when possibly present.

***

### toJSON()

> **toJSON**(): [`BloomFilterJSON`](../type-aliases/BloomFilterJSON.md)

Returns the JSON form.

#### Returns

[`BloomFilterJSON`](../type-aliases/BloomFilterJSON.md)

The bit width, hash count, packed buckets, and insertion count.

#### Implementation of

[`Serializable`](../../serializable/interfaces/Serializable.md).[`toJSON`](../../serializable/interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Summarizes the filter.

#### Returns

`string`

The bit width, hash count, and insertion count.

#### Implementation of

[`Serializable`](../../serializable/interfaces/Serializable.md).[`toString`](../../serializable/interfaces/Serializable.md#tostring)

***

### fromJSON()

> `static` **fromJSON**(`json`): `BloomFilter`

Restores a filter from its serialized bits.

#### Parameters

##### json

The bit width, hash count, buckets, and optional insertion count.

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

A filter with the restored bits.

***

### withTargetError()

> `static` **withTargetError**(`expectedItems`, `falsePositiveRate`): `BloomFilter`

Sizes a filter for an expected item count and false-positive rate.

#### Parameters

##### expectedItems

`number`

How many values the filter should hold.

##### falsePositiveRate

`number`

Target false-positive rate in `(0, 1)`.

#### Returns

`BloomFilter`

A filter sized by the standard Bloom bound.
