[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [commands/generate](../README.md) / GenerateFlags

# Interface: GenerateFlags

The flags each generator's schema accepts. The CLI exposes the full
surface (BLK-3): `ndigo generate component --name x --package y` (and
`ndigo generate header --file z`) must reach Nx — forwarding only `--name`
left component/header un-runnable when their required fields were missing.

## Properties

### author?

> `optional` **author?**: `string`

The generated author line.

***

### className?

> `optional` **className?**: `string`

The generated class name.

***

### description?

> `optional` **description?**: `string`

The package description.

***

### file?

> `optional` **file?**: `string`

The target file (header generator).

***

### force?

> `optional` **force?**: `boolean`

Overwrite an existing file.

***

### jobs?

> `optional` **jobs?**: `boolean`

Include jobs support in the package.

***

### module?

> `optional` **module?**: `string`

The module name for the header.

***

### name?

> `optional` **name?**: `string`

The generated symbol or package name.

***

### package?

> `optional` **package?**: `string`

The target package directory name.

***

### path?

> `optional` **path?**: `string`

The target path (readme generator).

***

### summary?

> `optional` **summary?**: `string`

The doc summary for the generated file.
