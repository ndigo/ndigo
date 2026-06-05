[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / validatedBy

# Function: validatedBy()

## Call Signature

> **validatedBy**\<`T`\>(`schema`, `extractor`): `ParameterExtractor`\<`T`\>

Defined in: packages/blue-validate/src/route-parameter.ts:50

Wraps a parameter extractor with a Zod schema for validation and coercion.

### Type Parameters

#### T

`T`

### Parameters

#### schema

`ZodType`\<`T`\>

#### extractor

`ParameterExtractor`

### Returns

`ParameterExtractor`\<`T`\>

### Example

```ts
@routeParams({
  user: validatedBy(UserSchema, bindValue('query'))
})
```

## Call Signature

> **validatedBy**\<`T`\>(`validator`, `typeName`, `extractor`): `ParameterExtractor`\<`T`\>

Defined in: packages/blue-validate/src/route-parameter.ts:60

Wraps a parameter extractor with a @blue/validate Validator.

### Type Parameters

#### T

`T`

### Parameters

#### validator

[`Validator`](../interfaces/Validator.md)

#### typeName

`string`

#### extractor

`ParameterExtractor`

### Returns

`ParameterExtractor`\<`T`\>

### Example

```ts
@routeParams({
  email: validatedBy(myValidator, 'Email', queryValue('email'))
})
```
