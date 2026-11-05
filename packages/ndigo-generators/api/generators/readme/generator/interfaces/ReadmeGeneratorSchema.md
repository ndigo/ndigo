[**@ndigo/generators v0.0.1**](../../../../README.md)

***

[@ndigo/generators](../../../../README.md) / [generators/readme/generator](../README.md) / ReadmeGeneratorSchema

# Interface: ReadmeGeneratorSchema

Options for the `readme` generator: the package name, its short description,
and an optional destination directory (defaults to `packages/ndigo-<name>`).

## Properties

### description?

> `optional` **description?**: `string`

Short one-line description used in the intro paragraph.

***

### name

> **name**: `string`

Package name (kebab-case, without the `ndigo-` prefix).

***

### path?

> `optional` **path?**: `string`

Destination directory for the README (defaults to `packages/ndigo-<name>`).
