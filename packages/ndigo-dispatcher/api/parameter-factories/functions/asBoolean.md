[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameter-factories](../README.md) / asBoolean

# Function: asBoolean()

> **asBoolean**(`extractor`): [`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

Wraps a parameter extractor to enforce boolean conversion.

## Parameters

### extractor

[`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

The extractor to wrap.

## Returns

[`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

The extractor with boolean conversion.

## Example

```ts
asBoolean(historyStateValue('isActive'))
```
