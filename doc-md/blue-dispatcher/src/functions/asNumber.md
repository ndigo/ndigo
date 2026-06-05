[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / asNumber

# Function: asNumber()

> **asNumber**(`extractor`): [`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

Defined in: packages/blue-dispatcher/src/route-parameter.ts:458

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
