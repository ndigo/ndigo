[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / resolveConverter

# Function: resolveConverter()

> **resolveConverter**(`option`, `registry?`, `options?`): [`ArgumentValueConverter`](../type-aliases/ArgumentValueConverter.md)

Defined in: packages/blue-platform-web/src/argument-value-converter.ts:103

Resolves a converter reference to an executable converter function.

## Parameters

### option

`string` \| [`ArgumentValueConverter`](../type-aliases/ArgumentValueConverter.md) \| `ParameterValueConverter` \| \{ `optional?`: `boolean`; `use`: `string` \| `ParameterValueConverter`; \} \| \{ `optional?`: `boolean`; `use`: `string` \| [`ArgumentValueConverter`](../type-aliases/ArgumentValueConverter.md); \}

### registry?

[`ArgumentValueConverterRegistry`](../type-aliases/ArgumentValueConverterRegistry.md) = `argumentValueConverters`

### options?

[`ConverterResolutionOptions`](../type-aliases/ConverterResolutionOptions.md) = `{}`

## Returns

[`ArgumentValueConverter`](../type-aliases/ArgumentValueConverter.md)
