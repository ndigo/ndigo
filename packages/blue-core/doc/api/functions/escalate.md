[**@blue/core v0.0.1**](../README.md)

***

[@blue/core](../README.md) / escalate

# Function: escalate()

> **escalate**\<`T`\>(`node`, `callback`, `inclusive?`): `void`

Traverses ancestors upward from the supplied node.

## Type Parameters

### T

`T` *extends* [`ChildNode`](../interfaces/ChildNode.md)\<`unknown`\>

## Parameters

### node

`T`

Starting node.

### callback

(`node`) => `unknown`

Function invoked for each visited node.

### inclusive?

`boolean` = `false`

When `true`, include the starting node in the traversal.

## Returns

`void`
