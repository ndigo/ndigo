[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / matrixParamCondition

# Function: matrixParamCondition()

> **matrixParamCondition**(`name`, `value?`, `options?`): `string`

Builds a matrix-parameter condition expression (`/path;color=red` →
`'color=red'`; presence check when `value` is omitted → `'color'`;
negation → `'!color'` / `'color!=x'`).

## Parameters

### name

`string`

### value?

`string`

### options?

[`ConditionBuilderOptions`](../interfaces/ConditionBuilderOptions.md)

## Returns

`string`
