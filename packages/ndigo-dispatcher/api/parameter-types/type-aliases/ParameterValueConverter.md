[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameter-types](../README.md) / ParameterValueConverter

# Type Alias: ParameterValueConverter

> **ParameterValueConverter** = (`value`, `context`) => `unknown`

Converts one raw argument value into the type its `MethodParameter` declares.
A converter is chosen per source/target type pair (see
`ResolverConverterOption`) and may be async.

## Parameters

### value

`unknown`

### context

[`ParameterValueConversionContext`](../interfaces/ParameterValueConversionContext.md)

## Returns

`unknown`
