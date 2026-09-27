[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / localStorageValue

# Function: localStorageValue()

> **localStorageValue**(`name?`, `options?`): [`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

Factory function: Create a local-storage parameter extractor.
Reads `localStorage` on the browser platform (scalar-only).

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
  token: localStorageValue('token'),
})
```
