[**@ndigo/openapi v0.0.1**](../../README.md)

***

[@ndigo/openapi](../../README.md) / [api-docs](../README.md) / OpenAPIResponseDocs

# Type Alias: OpenAPIResponseDocs

> **OpenAPIResponseDocs** = `z.ZodType`\<`unknown`\> \| \{ `description?`: `string`; `schema?`: `z.ZodType`\<`unknown`\>; \}

Documentation for one response status (AD-38 D-4).

A bare zod schema is shorthand for `{ description: 'OK', schema }` — the
typical case: the DTO schema the handler converts through (AD-38), which
the generator embeds via Zod's `toJSONSchema` seam. The object form
additionally allows a custom `description`.
