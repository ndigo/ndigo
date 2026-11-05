[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [abstract-platform-resolver](../README.md) / ConvertArgumentValueFn

# Type Alias: ConvertArgumentValueFn

> **ConvertArgumentValueFn** = (`convertType`, `value`, `parameter`, `route`, `mapping`, `registry?`, `options?`) => `unknown`

Function signature for platform-specific argument value conversion.

Each platform provides its own implementation (backed by ConversionService)
so that the shared `resolveArgument` pipeline can remain platform-agnostic.

## Parameters

### convertType

\{ `source`: `unknown`; `target`: `unknown`; \} \| `undefined`

### value

`unknown`

### parameter

[`MethodParameter`](../../parameter-types/classes/MethodParameter.md)

### route

[`Route`](#)

### mapping

`unknown`

### registry?

`unknown`

### options?

`unknown`

## Returns

`unknown`
