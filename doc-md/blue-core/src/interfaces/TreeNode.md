[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / TreeNode

# Interface: TreeNode\<T\>

Defined in: packages/blue-core/src/tree-node.ts:24

A tree node that supports bidirectional navigation and child mutation.

## Extends

- [`ChildNode`](ChildNode.md)\<`T`\>.[`ParentNode`](ParentNode.md)\<`T`\>

## Type Parameters

### T

`T` = `any`

## Properties

### parent

> `readonly` **parent**: `T` \| `null` \| `undefined`

Defined in: packages/blue-core/src/tree-node.ts:10

The parent node, or `null`/`undefined` for roots.

#### Inherited from

[`ChildNode`](ChildNode.md).[`parent`](ChildNode.md#parent)

***

### children

> `readonly` **children**: readonly `T`[]

Defined in: packages/blue-core/src/tree-node.ts:18

The node's direct children.

#### Inherited from

[`ParentNode`](ParentNode.md).[`children`](ParentNode.md#children)

***

### root

> `readonly` **root**: `T`

Defined in: packages/blue-core/src/tree-node.ts:26

The root node of the tree.

## Methods

### hasChild()

> **hasChild**(`node`): `boolean`

Defined in: packages/blue-core/src/tree-node.ts:34

Tests whether the node has the given direct child.

#### Parameters

##### node

`T`

Candidate child node.

#### Returns

`boolean`

`true` when the node is a direct child.

***

### newChild()

> **newChild**(...`args`): `T`

Defined in: packages/blue-core/src/tree-node.ts:42

Creates and appends a new child node.

#### Parameters

##### args

...`any`[]

Arguments used to construct the child.

#### Returns

`T`

The newly created child node.

***

### removeChild()

> **removeChild**(`node`): `boolean`

Defined in: packages/blue-core/src/tree-node.ts:50

Removes a direct child from the node.

#### Parameters

##### node

`T`

Child node to remove.

#### Returns

`boolean`

`true` when the child was removed.
