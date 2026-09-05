[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / Enumerable

# Interface: Enumerable\<K, V\>

Defined in: [packages/blue-core/src/enumerable.ts:12](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/enumerable.ts#lines-12)

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

Defined in: [packages/blue-core/src/enumerable.ts:17](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/enumerable.ts#lines-17)

Returns an iterator for the key-value pairs in the collection.

#### Returns

`Iterator`\<\[`K`, `V`\]\>

An iterator that yields `[key, value]` pairs.

***

### forEach()

> **forEach**(`callback`, `context?`): `void`

Defined in: [packages/blue-core/src/enumerable.ts:23](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/enumerable.ts#lines-23)

Executes a provided function once for each key-value pair in the collection.

#### Parameters

##### callback

(`value`, `key`, `list`) => `void`

Function to execute for each element. It receives `value`, `key`, and the `list` itself as arguments.

##### context?

`any`

Value to use as `this` when executing the `callback`.

#### Returns

`void`

***

### keys()

> **keys**(): `Iterator`\<`K`\>

Defined in: [packages/blue-core/src/enumerable.ts:28](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/enumerable.ts#lines-28)

Returns an iterator for the keys in the collection.

#### Returns

`Iterator`\<`K`\>

An iterator that yields keys.

***

### values()

> **values**(): `Iterator`\<`V`\>

Defined in: [packages/blue-core/src/enumerable.ts:33](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/enumerable.ts#lines-33)

Returns an iterator for the values in the collection.

#### Returns

`Iterator`\<`V`\>

An iterator that yields values.
