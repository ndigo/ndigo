[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [trie](../README.md) / Trie

# Class: Trie\<V\>

A value that can safely be converted to a string or JSON payload.

## Type Parameters

### V

`V` = `unknown`

## Implements

- [`Serializable`](../../serializable/interfaces/Serializable.md)
- [`Equatable`](../../equatable/interfaces/Equatable.md)\<`Trie`\<`V`\>\>

## Constructors

### Constructor

> **new Trie**\<`V`\>(): `Trie`\<`V`\>

#### Returns

`Trie`\<`V`\>

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

### clear()

> **clear**(): `void`

#### Returns

`void`

***

### delete()

> **delete**(`word`): `boolean`

#### Parameters

##### word

`string`

#### Returns

`boolean`

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

> **has**(`word`): `boolean`

#### Parameters

##### word

`string`

#### Returns

`boolean`

***

### insert()

> **insert**(`word`, `value`): `this`

#### Parameters

##### word

`string`

##### value

`V`

#### Returns

`this`

***

### search()

> **search**(`word`): `V` \| `undefined`

#### Parameters

##### word

`string`

#### Returns

`V` \| `undefined`

***

### startsWith()

> **startsWith**(`prefix`): `boolean`

#### Parameters

##### prefix

`string`

#### Returns

`boolean`

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

Returns a string representation of the value.

#### Returns

`string`

#### Implementation of

[`Serializable`](../../serializable/interfaces/Serializable.md).[`toString`](../../serializable/interfaces/Serializable.md#tostring)

***

### wordsWithPrefix()

> **wordsWithPrefix**(`prefix`): `Generator`\<\[`string`, `V`\]\>

#### Parameters

##### prefix

`string`

#### Returns

`Generator`\<\[`string`, `V`\]\>
