[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / validateParameters

# Function: validateParameters()

> **validateParameters**(`schema`, `extractors`): [`ParameterMap`](../type-aliases/ParameterMap.md)

Convenience overlay for [validatedBy](validatedBy.md) over a whole `parameters` map.

## Parameters

### schema

`ZodType`

The Zod schema validating the bound object.

### extractors

[`ParameterMap`](../type-aliases/ParameterMap.md)

The parameters map.

## Returns

[`ParameterMap`](../type-aliases/ParameterMap.md)

The map with the schema attached to each extractor.

## Example

```ts
@parameters(validateParameters(UserSchema, { user: dataBinderValue('query') }))
```
