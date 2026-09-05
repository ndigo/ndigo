[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / traverseSubtree

# Function: traverseSubtree()

> **traverseSubtree**(`context`, `visitor`): `void`

Defined in: [packages/blue-context/src/context-hierarchy.ts:180](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context-hierarchy.ts#lines-180)

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
