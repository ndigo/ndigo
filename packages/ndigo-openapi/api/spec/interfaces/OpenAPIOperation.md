[**@ndigo/openapi v0.0.1**](../../README.md)

***

[@ndigo/openapi](../../README.md) / [spec](../README.md) / OpenAPIOperation

# Interface: OpenAPIOperation

An OpenAPI operation object. Framework-specific conditions are preserved
under `x-ndigo-*` extensions rather than dropped.

## Properties

### deprecated?

> `optional` **deprecated?**: `boolean`

Whether the operation is deprecated.

***

### description?

> `optional` **description?**: `string`

Longer operation description.

***

### operationId?

> `optional` **operationId?**: `string`

Unique operation id (defaults to the handler method name).

***

### parameters?

> `optional` **parameters?**: [`OpenAPIParameter`](OpenAPIParameter.md)[]

Declared parameters.

***

### requestBody?

> `optional` **requestBody?**: [`OpenAPIRequestBody`](OpenAPIRequestBody.md)

Declared request body.

***

### responses

> **responses**: `Record`\<`string`, [`OpenAPIResponse`](OpenAPIResponse.md)\>

Responses keyed by status code.

***

### security?

> `optional` **security?**: `Record`\<`string`, `string`[]\>[]

Security requirements for this operation (scheme name → scopes). Set
from `@apiDocs({ security })`; overrides the document-level default.
An empty array documents an explicitly anonymous operation.

***

### summary?

> `optional` **summary?**: `string`

Short operation summary.

***

### tags?

> `optional` **tags?**: `string`[]

OpenAPI tags for grouping.

***

### x-ndigo-matrixParams?

> `optional` **x-ndigo-matrixParams?**: `string`[]

Framework matrix-parameter conditions (AD-35 D-2).

***

### x-ndigo-queryParams?

> `optional` **x-ndigo-queryParams?**: `string`[]

Framework query-parameter conditions (AD-35 D-2).
