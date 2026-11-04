[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / queryValue

# Function: queryValue()

> **queryValue**(`name?`, `options?`): [`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

Factory function: Create a query parameter extractor

## Parameters

### name?

`string`

### options?

[`ParameterExtractorOptions`](../interfaces/ParameterExtractorOptions.md) = `{}`

## Returns

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

## Example

```ts
`parameters`({
  page: queryValue('page'),
  limit: queryValue('limit', { required: true, defaultValue: '10' })
})
```
