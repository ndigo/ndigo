[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameter-factories](../README.md) / sessionStorageValue

# Function: sessionStorageValue()

> **sessionStorageValue**(`name?`, `options?`): [`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

Factory function: Create a session-storage parameter extractor.
Reads `sessionStorage` on the browser platform (scalar-only).

## Parameters

### name?

`string`

The storage key, or `''` for the whole jar.

### options?

[`ParameterExtractorOptions`](../../parameter-types/interfaces/ParameterExtractorOptions.md) = `{}`

Required/default/conversion options.

## Returns

[`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

The parameter extractor.

## Example

```ts
parameters({
  theme: sessionStorageValue('theme'),
})
```
