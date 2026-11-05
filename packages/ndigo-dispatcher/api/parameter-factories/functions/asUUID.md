[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameter-factories](../README.md) / asUUID

# Function: asUUID()

> **asUUID**(`extractor`): [`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

Wraps a parameter extractor to enforce UUID conversion.

## Parameters

### extractor

[`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

## Returns

[`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

## Example

```ts
asUUID(pathValue('userId'))
```
