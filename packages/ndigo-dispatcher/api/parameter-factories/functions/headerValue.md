[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameter-factories](../README.md) / headerValue

# Function: headerValue()

> **headerValue**(`name?`, `options?`): [`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

Factory function: Create a request-header parameter extractor.

## Parameters

### name?

`string`

The header name, or `''` for the whole header record.

### options?

[`ParameterExtractorOptions`](../../parameter-types/interfaces/ParameterExtractorOptions.md) = `{}`

Required/default/conversion options.

## Returns

[`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

The parameter extractor.

## Example

```ts
parameters({
  contentType: headerValue('content-type'),
  authorization: headerValue('authorization', { required: true })
})
```
