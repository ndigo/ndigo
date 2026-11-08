[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameter-factories](../README.md) / queryValue

# Function: queryValue()

> **queryValue**(`name?`, `options?`): [`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

Factory function: Create a query parameter extractor

## Parameters

### name?

`string`

The query parameter name, or `''` for the whole query.

### options?

[`ParameterExtractorOptions`](../../parameter-types/interfaces/ParameterExtractorOptions.md) = `{}`

Required/default/conversion options.

## Returns

[`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

The parameter extractor.

## Example

```ts
parameters({
  page: queryValue('page'),
  limit: queryValue('limit', { required: true, defaultValue: '10' })
})
```
