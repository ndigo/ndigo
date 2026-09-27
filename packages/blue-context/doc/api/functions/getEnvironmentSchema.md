[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / getEnvironmentSchema

# Function: getEnvironmentSchema()

> **getEnvironmentSchema**(`target`): `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\> \| `undefined`

Returns the schema declared on a class via `@environment`, if any.

## Parameters

### target

`unknown`

The class (or instance constructor).

## Returns

`ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\> \| `undefined`

The declared schema, or `undefined`.
