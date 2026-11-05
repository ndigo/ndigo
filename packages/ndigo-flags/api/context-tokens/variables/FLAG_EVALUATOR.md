[**@ndigo/flags v0.0.1**](../../README.md)

***

[@ndigo/flags](../../README.md) / [context-tokens](../README.md) / FLAG\_EVALUATOR

# Variable: FLAG\_EVALUATOR

> `const` **FLAG\_EVALUATOR**: [`ContextToken`](#)\<[`FlagEvaluator`](../../flag-evaluator/interfaces/FlagEvaluator.md)\>

The application's flag evaluator bean (default:
`PropertyFlagProvider` over the environment, registered by
`NodeAutoConfiguration`). Apps override the bean with a remote or
OpenFeature-backed evaluator for vendor flagging.
