[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameter-factories](../README.md) / fileValue

# Function: fileValue()

> **fileValue**(`partName?`, `options?`): [`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

Factory function: Create a multipart/form-data file-part extractor.
The client field name defaults to the method-argument name; pass an explicit
name only when the form field differs from the JS variable. Resolved by
`NodeMultipartFileMethodArgumentResolver` (ndigo-platform-node).

A missing part resolves to the extractor's `defaultValue` (`null`) unless
the part is declared required: `fileValue('avatar', { required: true })`
makes a missing upload a [MissingParameterError](../../error/classes/MissingParameterError.md) (HTTP 400) instead
of a late TypeError (DOC-5).

## Parameters

### partName?

`string`

The multipart field name; defaults to the argument name.

### options?

[`ParameterExtractorOptions`](../../parameter-types/interfaces/ParameterExtractorOptions.md) = `{}`

Extractor options (`required`).

## Returns

[`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

## Example

```ts
parameters({
  avatar: fileValue(),
  profile: fileValue('avatar_url'),
  cv: fileValue('cv', { required: true })
})
```
