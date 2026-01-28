[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / TreeNode

# Interface: TreeNode\<T\>

Defined in: packages/blue-core/src/tree-node.ts:13

## Author

Jeff Rose

## Extends

- [`ChildNode`](ChildNode.md)\<`T`\>.[`ParentNode`](ParentNode.md)\<`T`\>

## Type Parameters

### T

`T` = `any`

## Properties

### parent

> `readonly` **parent**: `T`

Defined in: packages/blue-core/src/tree-node.ts:6

#### Inherited from

[`ChildNode`](ChildNode.md).[`parent`](ChildNode.md#parent)

***

### children

> `readonly` **children**: `T`[]

Defined in: packages/blue-core/src/tree-node.ts:10

#### Inherited from

[`ParentNode`](ParentNode.md).[`children`](ParentNode.md#children)

***

### root

> `readonly` **root**: `T`

Defined in: packages/blue-core/src/tree-node.ts:14

## Methods

### hasChild()

> **hasChild**(`node`): `boolean`

Defined in: packages/blue-core/src/tree-node.ts:15

#### Parameters

##### node

`T`

#### Returns

`boolean`

***

### newChild()

> **newChild**(...`args`): `T`

Defined in: packages/blue-core/src/tree-node.ts:16

#### Parameters

##### args

...`any`[]

#### Returns

`T`

***

### removeChild()

> **removeChild**(`node`): `boolean`

Defined in: packages/blue-core/src/tree-node.ts:17

#### Parameters

##### node

`T`

#### Returns

`boolean`
