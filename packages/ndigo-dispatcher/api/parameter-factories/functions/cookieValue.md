[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameter-factories](../README.md) / cookieValue

# Function: cookieValue()

> **cookieValue**(`name?`, `options?`): [`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

Factory function: Create a cookie parameter extractor

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
  session: cookieValue('SESSIONID'),
  token: cookieValue('AUTH_TOKEN', { required: true })
})
```
