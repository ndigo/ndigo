[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameter-factories](../README.md) / matrixValue

# Function: matrixValue()

> **matrixValue**(`name`, `options?`): [`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

Factory function: Create a matrix parameter extractor

## Parameters

### name

`string`

The matrix-parameter name.

### options?

[`ParameterExtractorOptions`](../../parameter-types/interfaces/ParameterExtractorOptions.md) = `{}`

Required/default/conversion options.

## Returns

[`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

The parameter extractor.

## Example

```ts
parameters({
  color: matrixValue('color'),
  size: matrixValue('size', { required: true })
})
```
