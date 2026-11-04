[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / validatedBy

# Function: validatedBy()

> **validatedBy**\<`T`\>(`schema`, `extractor`): [`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

Wraps a parameter extractor with a Zod schema for validation and coercion.

## Type Parameters

### T

`T`

## Parameters

### schema

`ZodType`\<`T`\>

The Zod schema to validate and coerce the resolved value.

### extractor

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

The parameter extractor (e.g. `dataBinderValue('query')`).

## Returns

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

The extractor with the Zod validation attached.

## Example

```ts
const UserSchema = z.object({
    name: z.string().min(2),
    age: z.coerce.number().min(18),
});

@routeMapping('/create')
@parameters({ user: validatedBy(UserSchema, dataBinderValue('query')) })
create(user: z.infer<typeof UserSchema>) { … }
```
