[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / fileValue

# Function: fileValue()

> **fileValue**(`partName?`): [`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

Factory function: Create a multipart/form-data file-part extractor.
The client field name defaults to the method-argument name; pass an explicit
name only when the form field differs from the JS variable. Resolved by
`NodeMultipartFileMethodArgumentResolver` (blue-platform-node).

## Parameters

### partName?

`string`

## Returns

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

## Example

```ts
`parameters`({
  avatar: fileValue(),
  profile: fileValue('avatar_url')
})
```
