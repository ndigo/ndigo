[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [tree-node](../README.md) / escalate

# Function: escalate()

> **escalate**\<`T`\>(`node`, `callback`, `inclusive?`): `void`

Traverses ancestors upward from the supplied node.

## Type Parameters

### T

`T` *extends* [`ChildNode`](../interfaces/ChildNode.md)\<`T`\>

## Parameters

### node

`T`

Starting node.

### callback

(`node`) => `unknown`

Function invoked for each visited node; returning `false` stops traversal.

### inclusive?

`boolean` = `false`

When `true`, include the starting node in the traversal.

## Returns

`void`
