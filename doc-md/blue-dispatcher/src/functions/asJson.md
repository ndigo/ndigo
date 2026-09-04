[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / asJson

# Function: asJson()

> **asJson**\<`T`\>(`extractor`): [`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

Defined in: packages/blue-dispatcher/src/route-parameter.ts:441

Wraps a parameter extractor to enforce JSON conversion.

## Type Parameters

### T

`T` = `any`

## Parameters

### extractor

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

## Returns

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

## Example

```ts
asJson<UserProfile>(modelValue('profile'))
```
