[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [condition-builders](../README.md) / queryParamCondition

# Function: queryParamCondition()

> **queryParamCondition**(`name`, `value?`, `options?`): `string`

Builds a query-parameter condition expression (`?filter=all` →
`'filter=all'`; presence check when `value` is omitted → `'flag'`;
negation → `'!flag'` / `'flag!=x'`).

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
