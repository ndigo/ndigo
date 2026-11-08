[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [ui/registry-types](../README.md) / RegistryItem

# Interface: RegistryItem

One item in a registry chunk.

## Extended by

- [`LocatedRegistryItem`](LocatedRegistryItem.md)

## Properties

### dependencies?

> `readonly` `optional` **dependencies?**: readonly `string`[]

npm dependencies required by the item.

***

### description?

> `readonly` `optional` **description?**: `string`

One-line description.

***

### files?

> `readonly` `optional` **files?**: readonly [`RegistryFile`](RegistryFile.md)[]

Files the item installs.

***

### name

> `readonly` **name**: `string`

Unique item name, e.g. `dialog`.

***

### registryDependencies?

> `readonly` `optional` **registryDependencies?**: readonly `string`[]

Registry item names this item needs.

***

### title?

> `readonly` `optional` **title?**: `string`

Human-readable title.

***

### type

> `readonly` **type**: `string`

Registry item type, e.g. `registry:ui`.
