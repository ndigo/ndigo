[**@ndigo/openapi v0.0.1**](../../README.md)

***

[@ndigo/openapi](../../README.md) / [spec](../README.md) / OpenAPIParameter

# Interface: OpenAPIParameter

An OpenAPI parameter object.

## Properties

### description?

> `optional` **description?**: `string`

Human-readable parameter description.

***

### in

> **in**: `"query"` \| `"path"` \| `"header"` \| `"cookie"`

Where the parameter travels.

***

### name

> **name**: `string`

Parameter name as it appears in the request.

***

### required

> **required**: `boolean`

Whether the parameter is required.

***

### schema?

> `optional` **schema?**: [`OpenAPISchemaObject`](OpenAPISchemaObject.md)

The parameter's JSON Schema.
