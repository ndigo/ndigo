[**@ndigo/flags-openfeature v0.0.1**](../../../README.md)

***

[@ndigo/flags-openfeature](../../../README.md) / [web/openfeature-web-flag-evaluator](../README.md) / WebOpenFeatureFlagEvaluatorOptions

# Interface: WebOpenFeatureFlagEvaluatorOptions

Options for [WebOpenFeatureFlagEvaluator](../classes/WebOpenFeatureFlagEvaluator.md).

## Properties

### client?

> `optional` **client?**: `Client`

An explicit client (e.g. one carrying client-scoped hooks). Defaults
to the global client for [domain](#domain).

***

### domain?

> `optional` **domain?**: `string`

Domain (named-client) key resolved against the global web API.
