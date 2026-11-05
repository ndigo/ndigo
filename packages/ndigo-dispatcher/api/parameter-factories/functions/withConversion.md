[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameter-factories](../README.md) / withConversion

# Function: withConversion()

> **withConversion**(`extractor`, `convertType`): [`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

Wraps a parameter extractor to enforce type-based conversion via ConversionService.

## Parameters

### extractor

[`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

### convertType

#### source

`unknown`

#### target

`unknown`

## Returns

[`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

## Example

```ts
withConversion(queryValue('id'), { source: String, target: UUID })
```
