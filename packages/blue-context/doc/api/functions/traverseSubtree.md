[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / traverseSubtree

# Function: traverseSubtree()

> **traverseSubtree**(`context`, `visitor`): `void`

Walk a subtree depth-first from `context` (inclusive), invoking `visitor` for each node.

## Parameters

### context

[`ApplicationContext`](../interfaces/ApplicationContext.md)

The subtree root.

### visitor

(`context`) => `void`

A callback invoked for each visited context.

## Returns

`void`
