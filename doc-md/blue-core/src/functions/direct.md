[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / direct

# Function: direct()

> **direct**\<`T`\>(`node`, `callback`, `inclusive?`): `void`

Defined in: packages/blue-core/src/tree-node.ts:60

Traverses descendants depth-first from the supplied node.

## Type Parameters

### T

`T` *extends* [`ParentNode`](../interfaces/ParentNode.md)\<`any`\>

## Parameters

### node

`T`

Starting node.

### callback

(`node`) => `any`

Function invoked for each visited node.

### inclusive?

`boolean` = `false`

When `true`, include the starting node in the traversal.

## Returns

`void`
