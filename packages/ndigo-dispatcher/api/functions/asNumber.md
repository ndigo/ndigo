[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / asNumber

# Function: asNumber()

> **asNumber**(`extractor`): [`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

Wraps a parameter extractor to enforce number conversion.

## Parameters

### extractor

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

## Returns

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

## Example

```ts
asNumber(queryValue('age'))
```
