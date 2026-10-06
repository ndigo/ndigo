[**@blue/openapi v0.0.1**](../README.md)

***

[@blue/openapi](../README.md) / OpenAPIDocument

# Interface: OpenAPIDocument

The generated OpenAPI 3.0.3 document.

## Properties

### components?

> `optional` **components?**: `object`

Component schemas hoisted out of the operations: recursive DTOs (and
schemas registered with an `id`) convert to schemas whose `$ref`
pointers are document-root-relative, so they cannot embed inline.
Present only when at least one schema was hoisted.

#### schemas

> **schemas**: `Record`\<`string`, [`OpenAPISchemaObject`](OpenAPISchemaObject.md)\>

***

### info

> **info**: `object`

#### description?

> `optional` **description?**: `string`

#### title

> **title**: `string`

#### version

> **version**: `string`

***

### openapi

> **openapi**: `"3.0.3"`

***

### paths

> **paths**: `Record`\<`string`, [`OpenAPIPathItem`](../type-aliases/OpenAPIPathItem.md)\>

***

### servers?

> `optional` **servers?**: `object`[]

#### url

> **url**: `string`
