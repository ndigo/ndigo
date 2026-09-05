[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / escalate

# Function: escalate()

> **escalate**\<`T`\>(`node`, `callback`, `inclusive?`): `void`

Defined in: [packages/blue-core/src/tree-node.ts:75](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/tree-node.ts#lines-75)

Traverses ancestors upward from the supplied node.

## Type Parameters

### T

`T` *extends* [`ChildNode`](../interfaces/ChildNode.md)\<`any`\>

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
