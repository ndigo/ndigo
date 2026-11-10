[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [agent](../README.md) / AIRolloutOptions

# Interface: AIRolloutOptions

Model-rollout gate. The flag is evaluated as a boolean with a `false`
default, so a broken or missing flag disables the model (fail closed).

## Properties

### evaluator

> `readonly` **evaluator**: `FlagEvaluator`

The feature-flag evaluator.

***

### key

> `readonly` **key**: `string`

The flag key that must evaluate to `true`.
