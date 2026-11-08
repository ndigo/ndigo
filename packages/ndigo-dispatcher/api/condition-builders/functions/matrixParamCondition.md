[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [condition-builders](../README.md) / matrixParamCondition

# Function: matrixParamCondition()

> **matrixParamCondition**(`name`, `value?`, `options?`): `string`

Builds a matrix-parameter condition expression (`/path;color=red` →
`'color=red'`; presence check when `value` is omitted → `'color'`;
negation → `'!color'` / `'color!=x'`).

## Parameters

### name

`string`

The parameter name.

### value?

`string`

The expected value, or omitted for a presence check.

### options?

[`ConditionBuilderOptions`](../interfaces/ConditionBuilderOptions.md)

Builder options (negation, case sensitivity).

## Returns

`string`

The condition expression.
