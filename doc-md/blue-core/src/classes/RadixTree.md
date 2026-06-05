[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / RadixTree

# Class: RadixTree\<V\>

Defined in: packages/blue-core/src/radix-tree.ts:90

A radix tree implementation for URL routing.

## Implements

module:core.Serializable

## Type Parameters

### V

`V`

## Implements

- [`Serializable`](../interfaces/Serializable.md)

## Constructors

### Constructor

> **new RadixTree**\<`V`\>(): `RadixTree`\<`V`\>

Defined in: packages/blue-core/src/radix-tree.ts:100

#### Returns

`RadixTree`\<`V`\>

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-core/src/radix-tree.ts:96

The string tag for this class.

##### Returns

`string`

## Methods

### insert()

> **insert**(`pattern`, `value`): `void`

Defined in: packages/blue-core/src/radix-tree.ts:131

Inserts a pattern and its associated value into the radix tree.

#### Parameters

##### pattern

`string`

The pattern to insert.

##### value

`V`

The value associated with the pattern.

#### Returns

`void`

***

### lookup()

> **lookup**(`path`): [`RadixMatch`](../interfaces/RadixMatch.md)\<`V`\>

Defined in: packages/blue-core/src/radix-tree.ts:213

Looks up a path in the radix tree and returns the matching value with parameters.

#### Parameters

##### path

`string`

The path to look up.

#### Returns

[`RadixMatch`](../interfaces/RadixMatch.md)\<`V`\>

A match object if found, otherwise null.

***

### delete()

> **delete**(`pattern`): `boolean`

Defined in: packages/blue-core/src/radix-tree.ts:276

Deletes a pattern from the radix tree.

#### Parameters

##### pattern

`string`

The pattern to delete.

#### Returns

`boolean`

True if the pattern was found and deleted, false otherwise.

***

### toJSON()

> **toJSON**(): [`JSONValue`](../type-aliases/JSONValue.md)

Defined in: packages/blue-core/src/radix-tree.ts:337

Serializes the radix tree to a JSON object.

#### Returns

[`JSONValue`](../type-aliases/JSONValue.md)

A JSON object representation of the tree.

#### Implementation of

[`Serializable`](../interfaces/Serializable.md).[`toJSON`](../interfaces/Serializable.md#tojson)
