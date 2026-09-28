[**@blue/openapi v0.0.1**](../README.md)

***

[@blue/openapi](../README.md) / OpenAPIOperation

# Interface: OpenAPIOperation

An OpenAPI operation object. Framework-specific conditions are preserved
under `x-blue-*` extensions rather than dropped.

## Properties

### deprecated?

> `optional` **deprecated?**: `boolean`

***

### description?

> `optional` **description?**: `string`

***

### operationId?

> `optional` **operationId?**: `string`

***

### parameters?

> `optional` **parameters?**: [`OpenAPIParameter`](OpenAPIParameter.md)[]

***

### requestBody?

> `optional` **requestBody?**: [`OpenAPIRequestBody`](OpenAPIRequestBody.md)

***

### responses

> **responses**: `Record`\<`string`, [`OpenAPIResponse`](OpenAPIResponse.md)\>

***

### summary?

> `optional` **summary?**: `string`

***

### tags?

> `optional` **tags?**: `string`[]

***

### x-blue-matrixParams?

> `optional` **x-blue-matrixParams?**: `string`[]

Framework matrix-parameter conditions (AD-35 D-2).

***

### x-blue-queryParams?

> `optional` **x-blue-queryParams?**: `string`[]

Framework query-parameter conditions (AD-35 D-2).
