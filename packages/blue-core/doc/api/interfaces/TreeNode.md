[**@blue/core v0.0.1**](../README.md)

***

[@blue/core](../README.md) / TreeNode

# Interface: TreeNode\<T\>

A tree node that supports bidirectional navigation and child mutation.

## Extends

- [`ChildNode`](ChildNode.md)\<`T`\>.[`ParentNode`](ParentNode.md)\<`T`\>

## Type Parameters

### T

`T` = `unknown`

## Properties

### children

> `readonly` **children**: readonly `T`[]

The node's direct children.

#### Inherited from

[`ParentNode`](ParentNode.md).[`children`](ParentNode.md#children)

***

### parent

> `readonly` **parent**: `T` \| `null` \| `undefined`

The parent node, or `null`/`undefined` for roots.

#### Inherited from

[`ChildNode`](ChildNode.md).[`parent`](ChildNode.md#parent)

***

### root

> `readonly` **root**: `T`

The root node of the tree.

## Methods

### hasChild()

> **hasChild**(`node`): `boolean`

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

Creates and appends a new child node.

#### Parameters

##### args

...`unknown`[]

Arguments used to construct the child.

#### Returns

`T`

The newly created child node.

***

### removeChild()

> **removeChild**(`node`): `boolean`

Removes a direct child from the node.

#### Parameters

##### node

`T`

Child node to remove.

#### Returns

`boolean`

`true` when the child was removed.
