[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / bodyValue

# Function: bodyValue()

> **bodyValue**(`name?`, `options?`): [`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

Factory function: Create a request-body parameter extractor.
Omit the name to bind the entire parsed body object (`bodyValue()`).

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
  user: bodyValue('user'),
  payload: bodyValue()
})
```
