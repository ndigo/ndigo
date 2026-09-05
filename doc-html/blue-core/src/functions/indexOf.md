[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / indexOf

# Function: indexOf()

> **indexOf**\<`T`\>(`children`, `child`): `number`

Defined in: [packages/blue-core/src/tree-node.ts:92](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/tree-node.ts#lines-92)

Finds the index of a child within a list of tree nodes.

## Type Parameters

### T

`T` = `any`

## Parameters

### children

[`TreeNode`](../interfaces/TreeNode.md)\<`T`\>[]

Candidate children to search.

### child

[`TreeNode`](../interfaces/TreeNode.md)\<`T`\>

Child node to locate.

## Returns

`number`

The index of the child, or `-1` when it is not present.
