[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / ConvertArgumentValueFn

# Type Alias: ConvertArgumentValueFn

> **ConvertArgumentValueFn** = (`convertType`, `value`, `parameter`, `route`, `mapping`, `registry?`, `options?`) => `any`

Defined in: packages/blue-dispatcher/src/abstract-platform-resolver.ts:16

Function signature for platform-specific argument value conversion.

Each platform provides its own implementation (backed by ConversionService)
so that the shared `resolveArgument` pipeline can remain platform-agnostic.

## Parameters

### convertType

\{ `source`: `any`; `target`: `any`; \} \| `undefined`

### value

`any`

### parameter

[`MethodParameter`](../classes/MethodParameter.md)

### route

`Route`

### mapping

`any`

### registry?

`any`

### options?

`any`

## Returns

`any`
