[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [ndigo-platform-node](../README.md) / FeatureGateInterceptorOptions

# Interface: FeatureGateInterceptorOptions

Constructor overrides for the interceptor's beans — embedding and unit
tests. In the wired application the `FLAG_EVALUATOR` /
`FLAG_CONTEXT_RESOLVER` beans are the source, resolved per check so
app-level overrides apply.

## Properties

### contextResolver?

> `readonly` `optional` **contextResolver?**: [`FlagEvaluationContextResolver`](FlagEvaluationContextResolver.md)

The context resolver to use instead of the `FLAG_CONTEXT_RESOLVER` bean.

***

### evaluator?

> `readonly` `optional` **evaluator?**: `FlagEvaluator`

The evaluator to use instead of the `FLAG_EVALUATOR` bean.
