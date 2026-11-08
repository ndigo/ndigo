[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameter-factories](../README.md) / historyStateValue

# Function: historyStateValue()

> **historyStateValue**(`name?`, `options?`): [`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

Factory function: Create a history-state parameter extractor.
Reads `history.state` on the browser platform (nested-capable).

## Parameters

### name?

`string`

The history-state path, or `''` for the whole state.

### options?

[`ParameterExtractorOptions`](../../parameter-types/interfaces/ParameterExtractorOptions.md) = `{}`

Required/default/conversion options.

## Returns

[`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

The parameter extractor.

## Example

```ts
parameters({
  token: historyStateValue('token'),
})
```
