[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [zod-validated-by](../README.md) / validatedQuery

# Function: validatedQuery()

> **validatedQuery**\<`T`\>(`schema`): [`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

Sugar for validating the entire query object against a Zod schema.

Equivalent to [validatedBy](validatedBy.md)`(schema, queryValue())`. The no-argument
extractor binds the whole `route.data` object (all query parameters), so an
object schema validates/coerces the whole query — e.g.
`z.object({ page: z.coerce.number(), q: z.string() })` against
`?page=2&q=search`.

## Type Parameters

### T

`T`

## Parameters

### schema

`ZodType`\<`T`\>

The Zod schema validating the whole query object.

## Returns

[`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

A parameter extractor binding `queryValue()` through the schema.

## Example

```ts
@parameters({ search: validatedQuery(SearchSchema) })
search(search: z.infer<typeof SearchSchema>) { … }
```
