[**@blue/core v0.0.1**](../README.md)

***

[@blue/core](../README.md) / RadixMatch

# Interface: RadixMatch\<V\>

Result of a successful radix tree path lookup.

## Type Parameters

### V

`V`

## Properties

### params

> `readonly` **params**: `Record`\<`string`, `string`\> \| `null`

Named parameters extracted from the path, or `null` when none were captured.

***

### pattern

> `readonly` **pattern**: `string`

The original pattern string that was matched.

***

### value

> `readonly` **value**: `V`

The value stored at the matched node.
