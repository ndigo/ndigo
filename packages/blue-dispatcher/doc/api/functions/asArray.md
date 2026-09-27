[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / asArray

# Function: asArray()

> **asArray**(`extractor`): [`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

Wraps a parameter extractor to enforce array conversion.

## Parameters

### extractor

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

## Returns

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

## Example

```ts
asArray(queryValue('tags'))
```
