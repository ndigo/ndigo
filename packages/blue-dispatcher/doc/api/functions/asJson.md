[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / asJson

# Function: asJson()

> **asJson**\<`_T`\>(`extractor`): [`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

Wraps a parameter extractor to enforce JSON conversion.

## Type Parameters

### _T

`_T` = `unknown`

## Parameters

### extractor

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

## Returns

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

## Example

```ts
asJson<UserProfile>(sessionStorageValue('profile'))
```
