[**@ndigo/flags v0.0.1**](../../README.md)

***

[@ndigo/flags](../../README.md) / [flag-evaluator](../README.md) / likeFlagEvaluator

# Function: likeFlagEvaluator()

> **likeFlagEvaluator**(`value`): `value is FlagEvaluator`

Structural type guard for [FlagEvaluator](../interfaces/FlagEvaluator.md) — used where an entry or
option is resolved by shape instead of the [FLAG\_EVALUATOR](../../context-tokens/variables/FLAG_EVALUATOR.md) token.

## Parameters

### value

`unknown`

The value to inspect.

## Returns

`value is FlagEvaluator`

`true` when the value has a string `kind` and an `evaluate` method.
