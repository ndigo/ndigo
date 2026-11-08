[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [ui/registry-types](../README.md) / RegistryFile

# Interface: RegistryFile

One file entry in a registry item.

## Properties

### content?

> `readonly` `optional` **content?**: `string`

Inlined file body; when absent, `path` is read or fetched.

***

### path

> `readonly` **path**: `string`

Path relative to the chunk that declared the item.

***

### target?

> `readonly` `optional` **target?**: `string`

Install target; required for `registry:file` and `registry:page`.

***

### type

> `readonly` **type**: `string`

Registry file type (`registry:ui`, `registry:file`, ...).
