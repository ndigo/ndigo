[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [ui/registry-types](../README.md) / LocatedRegistryItem

# Interface: LocatedRegistryItem

An item plus the location of the chunk that declared it.

## Extends

- [`RegistryItem`](RegistryItem.md)

## Properties

### author?

> `readonly` `optional` **author?**: `string`

Author or upstream attribution.

#### Inherited from

[`RegistryItem`](RegistryItem.md).[`author`](RegistryItem.md#author)

***

### base

> `readonly` **base**: `string`

Directory or URL the item's file paths are relative to.

***

### categories?

> `readonly` `optional` **categories?**: readonly `string`[]

Browsing categories (e.g. `form`, `overlay`).

#### Inherited from

[`RegistryItem`](RegistryItem.md).[`categories`](RegistryItem.md#categories)

***

### dependencies?

> `readonly` `optional` **dependencies?**: readonly `string`[]

npm dependencies required by the item.

#### Inherited from

[`RegistryItem`](RegistryItem.md).[`dependencies`](RegistryItem.md#dependencies)

***

### description?

> `readonly` `optional` **description?**: `string`

One-line description.

#### Inherited from

[`RegistryItem`](RegistryItem.md).[`description`](RegistryItem.md#description)

***

### docs?

> `readonly` `optional` **docs?**: `string`

Install/usage note shown by the catalogue and MCP tools.

#### Inherited from

[`RegistryItem`](RegistryItem.md).[`docs`](RegistryItem.md#docs)

***

### files?

> `readonly` `optional` **files?**: readonly [`RegistryFile`](RegistryFile.md)[]

Files the item installs.

#### Inherited from

[`RegistryItem`](RegistryItem.md).[`files`](RegistryItem.md#files)

***

### name

> `readonly` **name**: `string`

Unique item name, e.g. `dialog`.

#### Inherited from

[`RegistryItem`](RegistryItem.md).[`name`](RegistryItem.md#name)

***

### registryDependencies?

> `readonly` `optional` **registryDependencies?**: readonly `string`[]

Registry item names this item needs.

#### Inherited from

[`RegistryItem`](RegistryItem.md).[`registryDependencies`](RegistryItem.md#registrydependencies)

***

### source

> `readonly` **source**: `string`

The root registry source the item came from.

***

### title?

> `readonly` `optional` **title?**: `string`

Human-readable title.

#### Inherited from

[`RegistryItem`](RegistryItem.md).[`title`](RegistryItem.md#title)

***

### type

> `readonly` **type**: `string`

Registry item type, e.g. `registry:ui`.

#### Inherited from

[`RegistryItem`](RegistryItem.md).[`type`](RegistryItem.md#type)
