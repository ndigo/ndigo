[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / asArray

# Function: asArray()

> **asArray**(`extractor`): [`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

Defined in: packages/blue-dispatcher/src/route-parameter.ts:457

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
