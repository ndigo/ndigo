[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameter-factories](../README.md) / attributeValue

# Function: attributeValue()

> **attributeValue**(`name?`, `options?`): [`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

Factory function: Create a route attribute parameter extractor.

## Parameters

### name?

`string`

### options?

[`ParameterExtractorOptions`](../../parameter-types/interfaces/ParameterExtractorOptions.md) = `{}`

## Returns

[`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

## Example

```ts
`parameters`({
  user: attributeValue('user')
})
```
