[**@blue/openapi v0.0.1**](../README.md)

***

[@blue/openapi](../README.md) / APIDocsMetadata

# Interface: APIDocsMetadata

Documentation metadata for a single handler method.

## Properties

### deprecated?

> `optional` **deprecated?**: `boolean`

Marks the operation deprecated in the spec.

***

### description?

> `optional` **description?**: `string`

Long-form operation description (OpenAPI `description`).

***

### hidden?

> `optional` **hidden?**: `boolean`

Excludes the operation from the generated spec entirely.

***

### operationId?

> `optional` **operationId?**: `string`

Explicit `operationId`; otherwise one is derived from method + path.

***

### summary?

> `optional` **summary?**: `string`

Short operation label (OpenAPI `summary`).

***

### tags?

> `optional` **tags?**: `string`[]

Tags grouping this operation in the docs UI.
