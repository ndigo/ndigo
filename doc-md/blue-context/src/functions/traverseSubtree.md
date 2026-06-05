[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / traverseSubtree

# Function: traverseSubtree()

> **traverseSubtree**(`context`, `visitor`): `void`

Defined in: packages/blue-context/src/context-hierarchy.ts:176

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
