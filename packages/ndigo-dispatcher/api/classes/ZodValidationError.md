[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / ZodValidationError

# Class: ZodValidationError

The `cause` carried by a `ParameterConversionError` thrown from
[validatedBy](../functions/validatedBy.md). Preserves the flattened human-readable message (in
`message`) alongside the machine-readable per-issue details (in `issues`),
so error resolvers can render either a flat detail string or a structured
`errors` array.

## Extends

- `Error`

## Constructors

### Constructor

> **new ZodValidationError**(`message`, `issues`): `ZodValidationError`

Create a validation error.

#### Parameters

##### message

`string`

The flattened, human-readable failure message.

##### issues

readonly [`ValidationIssue`](../interfaces/ValidationIssue.md)[]

The structured per-field failures.

#### Returns

`ZodValidationError`

#### Overrides

`Error.constructor`

## Properties

### issues

> `readonly` **issues**: readonly [`ValidationIssue`](../interfaces/ValidationIssue.md)[]

The structured per-field failures from the Zod parse.
