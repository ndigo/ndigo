[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [zod-validated-by](../README.md) / validateParameters

# Function: validateParameters()

> **validateParameters**(`schema`, `extractors`): [`ParameterMap`](../../parameter-types/type-aliases/ParameterMap.md)

Convenience overlay for [validatedBy](validatedBy.md) over a whole `parameters` map.

## Parameters

### schema

`ZodType`

The Zod schema validating the bound object.

### extractors

[`ParameterMap`](../../parameter-types/type-aliases/ParameterMap.md)

The parameters map.

## Returns

[`ParameterMap`](../../parameter-types/type-aliases/ParameterMap.md)

The map with the schema attached to each extractor.

## Example

```ts
class UserController {
  @parameters(validateParameters(UserSchema, { user: dataBinderValue('query') }))
  create(user: z.infer<typeof UserSchema>) {}
}
```
