[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [radix-tree](../README.md) / RadixTree

# Class: RadixTree\<V\>

A radix tree implementation for URL routing.

## Remarks

Patterns support static segments, `:param`, single-segment `*`, and
greedy `**`/`{*name}`; probe order per segment is static → param → wildcard →
greedy, with the deepest greedy child as a backtracking fallback.

## Example

```ts
const tree = new RadixTree<string>();
tree.insert('/users/:id', 'getUser');
tree.lookup('/users/42')?.params; // { id: '42' }
```

## Type Parameters

### V

`V`

## Implements

- [`Serializable`](../../serializable/interfaces/Serializable.md)

## Constructors

### Constructor

> **new RadixTree**\<`V`\>(): `RadixTree`\<`V`\>

#### Returns

`RadixTree`\<`V`\>

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

The string tag for this class.

##### Returns

`string`

## Methods

### delete()

> **delete**(`pattern`): `boolean`

Deletes a pattern from the radix tree.

#### Parameters

##### pattern

`string`

The pattern to delete.

#### Returns

`boolean`

True if the pattern was found and deleted, false otherwise.

***

### insert()

> **insert**(`pattern`, `value`): `void`

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

> **lookup**(`path`): [`RadixMatch`](../interfaces/RadixMatch.md)\<`V`\> \| `null`

Looks up a path in the radix tree and returns the matching value with parameters.

Probe order per segment is static → param → single-segment wildcard →
greedy. A greedy child (`**` / `{*name}`, D-1) matches the *rest of the
path* (zero or more segments). Because a more specific branch may fail
deeper in the tree, the deepest greedy child passed on the way down is
remembered and used as a backtracking fallback.

#### Parameters

##### path

`string`

The path to look up.

#### Returns

[`RadixMatch`](../interfaces/RadixMatch.md)\<`V`\> \| `null`

A match object if found, otherwise null.

***

### toJSON()

> **toJSON**(): [`JSONValue`](../../serializable/type-aliases/JSONValue.md)

Serializes the radix tree to a JSON object.

#### Returns

[`JSONValue`](../../serializable/type-aliases/JSONValue.md)

A JSON object representation of the tree.

#### Implementation of

[`Serializable`](../../serializable/interfaces/Serializable.md).[`toJSON`](../../serializable/interfaces/Serializable.md#tojson)
