[**@blue/generators v0.0.1**](../README.md)

***

[@blue/generators](../README.md) / HeaderGeneratorSchema

# Interface: HeaderGeneratorSchema

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

### module?

> `optional` **module?**: `string`

Module name for the `@module` tag; inferred from the file path when omitted.

***

### summary?

> `optional` **summary?**: `string`

One-line summary used as the description in the doc header.
