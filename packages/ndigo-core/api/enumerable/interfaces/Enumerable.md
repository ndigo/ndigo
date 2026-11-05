[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [enumerable](../README.md) / Enumerable

# Interface: Enumerable\<K, V\>

Represents an object that can be iterated over, providing methods to access its entries, keys, and values.

## Type Parameters

### K

`K` *extends* `PropertyKey`

The type of the keys in the enumerable collection.

### V

`V`

The type of the values in the enumerable collection.

## Methods

### entries()

> **entries**(): `Iterator`\<\[`K`, `V`\]\>

Returns an iterator for the key-value pairs in the collection.

#### Returns

`Iterator`\<\[`K`, `V`\]\>

An iterator that yields `[key, value]` pairs.

***

### forEach()

> **forEach**(`callback`, `context?`): `void`

Executes a provided function once for each key-value pair in the collection.

#### Parameters

##### callback

(`value`, `key`, `list`) => `void`

Function to execute for each element. It receives `value`, `key`, and the `list` itself as arguments.

##### context?

`unknown`

Value to use as `this` when executing the `callback`.

#### Returns

`void`

***

### keys()

> **keys**(): `Iterator`\<`K`\>

Returns an iterator for the keys in the collection.

#### Returns

`Iterator`\<`K`\>

An iterator that yields keys.

***

### values()

> **values**(): `Iterator`\<`V`\>

Returns an iterator for the values in the collection.

#### Returns

`Iterator`\<`V`\>

An iterator that yields values.
