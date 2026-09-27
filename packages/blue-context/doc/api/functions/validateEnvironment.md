[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / validateEnvironment

# Function: validateEnvironment()

> **validateEnvironment**(`resolver`, `schema`): [`ValidationResult`](../interfaces/ValidationResult.md)

Validates the resolved values of a property resolver against a zod schema.

Aggregate (AD-17 Q1): every violation is reported — validation's point is
the full report. Report-only (Q2): zod transforms/defaults are never
written back — the environment is the source of truth; conversion is P4's
binding.

## Parameters

### resolver

`Pick`\<[`PropertyResolver`](../interfaces/PropertyResolver.md), `"getProperty"`\>

The property resolver (or environment) to validate.

### schema

`ZodType`

The zod schema of the expected shape.

## Returns

[`ValidationResult`](../interfaces/ValidationResult.md)

The aggregate validation result.

## Example

```ts
const { valid, issues } = validateEnvironment(environment, schema);
```
