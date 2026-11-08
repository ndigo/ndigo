[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [ui/registry-types](../README.md) / RegistryChunk

# Interface: RegistryChunk

A registry chunk (`registry.json`).

## Properties

### homepage?

> `readonly` `optional` **homepage?**: `string`

Registry homepage (root chunks only).

***

### include?

> `readonly` `optional` **include?**: readonly `string`[]

Nested registry files to merge.

***

### items?

> `readonly` `optional` **items?**: readonly [`RegistryItem`](RegistryItem.md)[]

Items declared in this chunk.

***

### name?

> `readonly` `optional` **name?**: `string`

Registry name (root chunks only).
