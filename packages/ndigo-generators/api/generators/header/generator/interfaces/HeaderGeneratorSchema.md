[**@ndigo/generators v0.0.1**](../../../../README.md)

***

[@ndigo/generators](../../../../README.md) / [generators/header/generator](../README.md) / HeaderGeneratorSchema

# Interface: HeaderGeneratorSchema

Options for the `header` generator: the target file, the summary and author
values, and `force` to replace an existing top-of-file block instead of
failing.

## Properties

### author?

> `optional` **author?**: `string`

Value for the `@author` tag (defaults to `Jeff Rose`).

***

### file

> **file**: `string`

Target file path (src or test).

***

### force?

> `optional` **force?**: `boolean`

Replace an existing top-of-file doc block instead of failing.

***

### summary?

> `optional` **summary?**: `string`

One-line summary used as the description in the doc header.
