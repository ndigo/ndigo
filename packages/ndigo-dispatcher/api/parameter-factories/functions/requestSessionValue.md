[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameter-factories](../README.md) / requestSessionValue

# Function: requestSessionValue()

> **requestSessionValue**(`name?`, `options?`): [`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

Factory function: Create a request-session parameter extractor.
Reads `request.session` on the Node platform (nested-capable).

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
  userId: requestSessionValue('userId'),
  token: requestSessionValue('AUTH_TOKEN', { required: true })
})
```
