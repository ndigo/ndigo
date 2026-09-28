[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / queryParamCondition

# Function: queryParamCondition()

> **queryParamCondition**(`name`, `value?`, `options?`): `string`

Builds a query-parameter condition expression (`?filter=all` →
`'filter=all'`; presence check when `value` is omitted → `'flag'`;
negation → `'!flag'` / `'flag!=x'`).

## Parameters

### name

`string`

### value?

`string`

### options?

[`ConditionBuilderOptions`](../interfaces/ConditionBuilderOptions.md)

## Returns

`string`
