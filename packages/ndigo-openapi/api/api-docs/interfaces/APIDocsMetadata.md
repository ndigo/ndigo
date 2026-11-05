[**@ndigo/openapi v0.0.1**](../../README.md)

***

[@ndigo/openapi](../../README.md) / [api-docs](../README.md) / APIDocsMetadata

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

### responses?

> `optional` **responses?**: `Record`\<`string`, [`OpenAPIResponseDocs`](../type-aliases/OpenAPIResponseDocs.md)\>

Optional per-status response documentation; bare schemas embed into
`content['application/json']`. When declared, this set **replaces**
the implicit `200: { description: 'OK' }` (declare `'200'` yourself to
keep it); without it the generator emits the default `200 OK`.

***

### security?

> `optional` **security?**: `string`[]

Security scheme names this operation requires (OpenAPI `security`);
names refer to schemes declared via
`OpenAPIGeneratorOptions.securitySchemes`. Overrides the document-level
default; an empty array documents an explicitly anonymous operation.
Without it the operation inherits the document default.

***

### summary?

> `optional` **summary?**: `string`

Short operation label (OpenAPI `summary`).

***

### tags?

> `optional` **tags?**: `string`[]

Tags grouping this operation in the docs UI.
