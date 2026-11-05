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

***

### className?

> `optional` **className?**: `string`

***

### description?

> `optional` **description?**: `string`

***

### file?

> `optional` **file?**: `string`

***

### force?

> `optional` **force?**: `boolean`

***

### jobs?

> `optional` **jobs?**: `boolean`

***

### module?

> `optional` **module?**: `string`

***

### name?

> `optional` **name?**: `string`

***

### package?

> `optional` **package?**: `string`

***

### path?

> `optional` **path?**: `string`

***

### summary?

> `optional` **summary?**: `string`

