[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / asBoolean

# Function: asBoolean()

> **asBoolean**(`extractor`): [`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

Wraps a parameter extractor to enforce boolean conversion.

## Parameters

### extractor

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

## Returns

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

## Example

```ts
asBoolean(historyStateValue('isActive'))
```
