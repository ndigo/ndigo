[**@blue/flags-openfeature v0.0.1**](../../README.md)

***

[@blue/flags-openfeature](../../README.md) / [blue-flags-openfeature](../README.md) / OpenFeatureFlagEvaluatorOptions

# Interface: OpenFeatureFlagEvaluatorOptions

Options for [OpenFeatureFlagEvaluator](../classes/OpenFeatureFlagEvaluator.md).

## Properties

### client?

> `optional` **client?**: `Client`

An explicit client (e.g. one carrying client-scoped hooks or
context). Defaults to the global client for [domain](#domain).

***

### domain?

> `optional` **domain?**: `string`

Domain (named-client) key resolved against the global API.
