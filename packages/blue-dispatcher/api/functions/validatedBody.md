[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / validatedBody

# Function: validatedBody()

> **validatedBody**\<`T`\>(`schema`): [`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

Sugar for validating the entire parsed request body against a Zod schema.

Equivalent to [validatedBy](validatedBy.md)`(schema, bodyValue())`. The no-argument
extractor binds the whole parsed body object (Node platform).

## Type Parameters

### T

`T`

## Parameters

### schema

`ZodType`\<`T`\>

The Zod schema validating the whole body.

## Returns

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

A parameter extractor binding `bodyValue()` through the schema.

## Example

```ts
@parameters({ note: validatedBody(NoteSchema) })
create(note: z.infer<typeof NoteSchema>) { … }
```
