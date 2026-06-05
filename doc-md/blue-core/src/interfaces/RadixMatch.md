[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / RadixMatch

# Interface: RadixMatch\<V\>

Defined in: packages/blue-core/src/radix-tree.ts:13

Result of a successful radix tree path lookup.

## Type Parameters

### V

`V`

## Properties

### value

> `readonly` **value**: `V`

Defined in: packages/blue-core/src/radix-tree.ts:15

The value stored at the matched node.

***

### params

> `readonly` **params**: `Record`\<`string`, `string`\>

Defined in: packages/blue-core/src/radix-tree.ts:17

Named parameters extracted from the path, or `null` when none were captured.

***

### pattern

> `readonly` **pattern**: `string`

Defined in: packages/blue-core/src/radix-tree.ts:19

The original pattern string that was matched.
