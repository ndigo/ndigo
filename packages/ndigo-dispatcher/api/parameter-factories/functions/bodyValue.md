[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameter-factories](../README.md) / bodyValue

# Function: bodyValue()

> **bodyValue**(`name?`, `options?`): [`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

Factory function: Create a request-body parameter extractor.
Omit the name to bind the entire parsed body object (`bodyValue()`).

## Parameters

### name?

`string`

The body field name, or `''` for the whole body.

### options?

[`ParameterExtractorOptions`](../../parameter-types/interfaces/ParameterExtractorOptions.md) = `{}`

Required/default/conversion options.

## Returns

[`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

The parameter extractor.

## Example

```ts
parameters({
  user: bodyValue('user'),
  payload: bodyValue()
})
```
