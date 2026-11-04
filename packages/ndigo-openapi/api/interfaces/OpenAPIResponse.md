[**@ndigo/openapi v0.0.1**](../README.md)

***

[@ndigo/openapi](../README.md) / OpenAPIResponse

# Interface: OpenAPIResponse

An OpenAPI operation response object.

## Properties

### content?

> `optional` **content?**: `Record`\<`string`, \{ `schema?`: [`OpenAPISchemaObject`](OpenAPISchemaObject.md); \}\>

Response content — e.g. `{ 'application/json': { schema } }` when the
handler declares its DTO via `@apiDocs({ responses })` (AD-38 D-4).

***

### description

> **description**: `string`
