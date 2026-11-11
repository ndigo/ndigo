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

Number of stored words.

##### Returns

`number`

## Methods

### clear()

> **clear**(): `void`

Removes every word.

#### Returns

`void`

***

### delete()

> **delete**(`word`): `boolean`

Removes a word and prunes now-empty branches.

#### Parameters

##### word

`string`

The exact key to remove.

#### Returns

`boolean`

`true` when the word was present.

***

### equals()

> **equals**(`value`): `boolean`

Compares every stored word and value.

#### Parameters

##### value

`unknown`

The candidate to compare against.

#### Returns

`boolean`

`true` when both tries hold the same words and values.

#### Implementation of

[`Equatable`](../../equatable/interfaces/Equatable.md).[`equals`](../../equatable/interfaces/Equatable.md#equals)

***

### has()

> **has**(`word`): `boolean`

Tests for a complete word.

#### Parameters

##### word

`string`

The exact key to test.

#### Returns

`boolean`

`true` when the word was inserted.

***

### insert()

> **insert**(`word`, `value`): `this`

Adds a word or replaces its value.

#### Parameters

##### word

`string`

The key to store.

##### value

`V`

The value to associate with the key.

#### Returns

`this`

This trie, for chaining.

***

### search()

> **search**(`word`): `V` \| `undefined`

Looks up a complete word.

#### Parameters

##### word

`string`

The exact key to find.

#### Returns

`V` \| `undefined`

The stored value, or `undefined` when the word is absent.

***

### startsWith()

> **startsWith**(`prefix`): `boolean`

Tests whether any word begins with the prefix.

#### Parameters

##### prefix

`string`

The prefix to test.

#### Returns

`boolean`

`true` when a stored word starts with `prefix`.

***

### toJSON()

> **toJSON**(): [`JSONArray`](../../serializable/interfaces/JSONArray.md)

Returns the entries as `[word, value]` pairs.

#### Returns

[`JSONArray`](../../serializable/interfaces/JSONArray.md)

A JSON array of word/value pairs.

#### Implementation of

[`Serializable`](../../serializable/interfaces/Serializable.md).[`toJSON`](../../serializable/interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Summarizes the trie.

#### Returns

`string`

The stored word count.

#### Implementation of

[`Serializable`](../../serializable/interfaces/Serializable.md).[`toString`](../../serializable/interfaces/Serializable.md#tostring)

***

### wordsWithPrefix()

> **wordsWithPrefix**(`prefix`): `Generator`\<\[`string`, `V`\]\>

Yields every word starting with the prefix, depth first.

#### Parameters

##### prefix

`string`

The prefix to expand; `''` yields every word.

#### Returns

`Generator`\<\[`string`, `V`\]\>

A generator of `[word, value]` pairs.
