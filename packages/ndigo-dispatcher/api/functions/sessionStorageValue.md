[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / sessionStorageValue

# Function: sessionStorageValue()

> **sessionStorageValue**(`name?`, `options?`): [`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

Factory function: Create a session-storage parameter extractor.
Reads `sessionStorage` on the browser platform (scalar-only).

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
  theme: sessionStorageValue('theme'),
})
```
