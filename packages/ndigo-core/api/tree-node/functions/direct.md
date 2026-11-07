[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [tree-node](../README.md) / direct

# Function: direct()

> **direct**\<`T`\>(`node`, `callback`, `inclusive?`): `void`

Traverses descendants depth-first from the supplied node.

## Type Parameters

### T

`T` *extends* [`ParentNode`](../interfaces/ParentNode.md)\<`T`\>

## Parameters

### node

`T`

Starting node.

### callback

(`node`) => `unknown`

Function invoked for each visited node; returning `false` prunes that node's descendants.

### inclusive?

`boolean` = `false`

When `true`, include the starting node in the traversal.

## Returns

`void`

## Example

```ts
direct(root, (node) => console.log(node));
```
