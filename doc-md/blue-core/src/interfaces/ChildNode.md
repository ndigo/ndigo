[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / ChildNode

# Interface: ChildNode\<T\>

Defined in: [packages/blue-core/src/tree-node.ts:8](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/tree-node.ts#lines-8)

A node that can reference its parent.

## Extended by

- [`TreeNode`](TreeNode.md)

## Type Parameters

### T

`T` = `any`

## Properties

### parent

> `readonly` **parent**: `T` \| `null` \| `undefined`

Defined in: [packages/blue-core/src/tree-node.ts:10](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/tree-node.ts#lines-10)

The parent node, or `null`/`undefined` for roots.
